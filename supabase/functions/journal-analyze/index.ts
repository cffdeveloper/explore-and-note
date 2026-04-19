// Edge function: analyze a single day's journal entry against the learner's
// notes/files added that same day, then store AI analysis + next-day plan.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { entry_date } = (await req.json()) as { entry_date: string };
    if (!entry_date) return json({ error: "entry_date required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // The day's journal entry
    const { data: entry } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("entry_date", entry_date)
      .maybeSingle();
    if (!entry || !entry.content?.trim()) {
      return json({ error: "Write something for today first." }, 400);
    }

    // Same-day attachments + notes (created_at on that calendar day)
    const dayStart = `${entry_date}T00:00:00Z`;
    const dayEnd = `${entry_date}T23:59:59Z`;
    const [{ data: dayAtts }, { data: dayNotes }, { data: pastEntries }] = await Promise.all([
      supabase.from("item_attachments").select("item_id, kind, title, url")
        .gte("created_at", dayStart).lte("created_at", dayEnd),
      supabase.from("item_notes").select("item_id, content, updated_at")
        .gte("updated_at", dayStart).lte("updated_at", dayEnd),
      supabase.from("journal_entries").select("entry_date, content, ai_analysis")
        .lt("entry_date", entry_date).order("entry_date", { ascending: false }).limit(5),
    ]);

    const todayLearning = [
      ...(dayAtts ?? []).map((a) => `• [${a.item_id}] ${a.kind}: ${a.title || a.url}`),
      ...(dayNotes ?? []).map((n) => `• [${n.item_id}] note: ${n.content.slice(0, 200)}`),
    ].join("\n") || "(no files or notes added today)";

    const history = (pastEntries ?? [])
      .map((e) => `${e.entry_date}: ${e.content.slice(0, 250)}`)
      .join("\n") || "(no prior entries)";

    const systemPrompt = `You are a polymath learning coach for a 20-year-old on a deliberate 10-year plan across 8 pillars (3 careers + 5 multiplier skills). Your job: read TODAY's day-account + what they uploaded/noted today, compare against their recent days, and produce honest, actionable feedback.

Return STRICT JSON (no markdown fences):
{
  "analysis": "3-5 sentences on what they actually did today, what worked, what was wasted time, gaps vs goals.",
  "next_day": "Concrete plan for tomorrow: 3-5 bullet items, time-boxed if possible.",
  "draft": "A 2-3 sentence updated 'who you are becoming' draft — refresh based on cumulative evidence."
}`;

    const userPrompt = `DATE: ${entry_date}

DAY ACCOUNT (what the learner says they did):
${entry.content}

LEARNING ARTIFACTS ADDED TODAY:
${todayLearning}

RECENT DAYS (most recent first):
${history}

Produce the JSON now.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI error", aiRes.status, txt);
      if (aiRes.status === 429) return json({ error: "Rate limit, try again shortly." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    let parsed: { analysis?: string; next_day?: string; draft?: string };
    try {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : cleaned);
    } catch (e) {
      console.error("parse fail", e, cleaned.slice(0, 500));
      return json({ error: "Could not parse AI response" }, 500);
    }

    const { error: updErr } = await supabase
      .from("journal_entries")
      .update({
        ai_analysis: parsed.analysis ?? null,
        ai_next_day: parsed.next_day ?? null,
        ai_draft: parsed.draft ?? null,
        analyzed_at: new Date().toISOString(),
      })
      .eq("entry_date", entry_date);
    if (updErr) console.error("update err", updErr);

    return json({ ok: true, ...parsed });
  } catch (e) {
    console.error("journal-analyze error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
