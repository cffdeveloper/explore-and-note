// Edge function: generate tomorrow's adaptive plan based on
// the user's fixed schedule, today's journal, and stated changes for tomorrow.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { entry_date, tomorrow_notes } = (await req.json()) as {
      entry_date: string;
      tomorrow_notes?: string;
    };
    if (!entry_date) return json({ error: "entry_date required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const [{ data: schedule }, { data: today }, { data: pastEntries }] = await Promise.all([
      supabase.from("schedule_blocks").select("*").order("sort_order", { ascending: true }),
      supabase.from("journal_entries").select("*").eq("entry_date", entry_date).maybeSingle(),
      supabase
        .from("journal_entries")
        .select("entry_date, ai_analysis")
        .lt("entry_date", entry_date)
        .order("entry_date", { ascending: false })
        .limit(5),
    ]);

    const scheduleStr =
      (schedule ?? [])
        .map((s) => `- ${s.start_time}–${s.end_time}  ${s.activity} [${s.category ?? "-"}]`)
        .join("\n") || "(no schedule defined)";

    const recent =
      (pastEntries ?? [])
        .map((e) => `${e.entry_date}: ${(e.ai_analysis ?? "").slice(0, 200)}`)
        .join("\n") || "(no recent analysis)";

    const systemPrompt = `You are a polymath performance coach. The learner has a FIXED daily schedule across 8 pillars. Adapt tomorrow's plan to (a) what they actually did today, (b) anything they said is happening tomorrow, and (c) recurring weaknesses from recent days. Keep their non-negotiables (sleep, workout, deep work) — only shift discretionary blocks.

Return STRICT JSON (no markdown fences):
{
  "summary": "2-3 sentences on what tomorrow looks like and why.",
  "blocks": [
    { "start": "HH:MM", "end": "HH:MM", "activity": "...", "focus": "specific task or goal for this block" }
  ],
  "non_negotiables": ["..."],
  "watch_outs": ["..."]
}

Rules:
- Use 24h times. Cover the full day.
- "focus" must be a concrete task — not 'study data science' but 'finish chapter 3 + 5 problems on probability'.
- If tomorrow_notes mentions an event, restructure around it but compress (don't delete) the displaced blocks.`;

    const userPrompt = `BASE SCHEDULE:
${scheduleStr}

TODAY (${entry_date}) JOURNAL:
${today?.content ?? "(no entry)"}

TODAY'S AI ANALYSIS:
${today?.ai_analysis ?? "(none)"}

WHAT'S HAPPENING TOMORROW (user-provided):
${tomorrow_notes?.trim() || "(nothing special)"}

RECENT DAYS' ANALYSIS:
${recent}

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
    const raw: string = aiJson.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    let parsed: Record<string, unknown>;
    try {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : cleaned);
    } catch (e) {
      console.error("parse fail", e, cleaned.slice(0, 500));
      return json({ error: "Could not parse AI response" }, 500);
    }

    // Persist the plan onto today's entry (so the user sees it the next morning)
    await supabase
      .from("journal_entries")
      .upsert(
        { entry_date, ai_tomorrow_plan: parsed },
        { onConflict: "entry_date" },
      );

    return json({ ok: true, plan: parsed });
  } catch (e) {
    console.error("plan-tomorrow error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
