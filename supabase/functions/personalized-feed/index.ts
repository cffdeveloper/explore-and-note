// Edge function: personalized-feed
// Reads all notes + attachment titles from DB, asks Gemini (with Google Search
// grounding) to find current real-world events or opportunities matching the
// user's learning trajectory. Caches results in `recommendations`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Kind = "event" | "opportunity";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { kind } = (await req.json()) as { kind: Kind };
    if (kind !== "event" && kind !== "opportunity") {
      return json({ error: "Invalid kind" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Pull ALL notes + attachment titles to build a learning profile.
    const [{ data: notes }, { data: atts }] = await Promise.all([
      supabase.from("item_notes").select("item_id, content").not("content", "eq", ""),
      supabase.from("item_attachments").select("item_id, title, url, kind"),
    ]);

    const notesText = (notes ?? [])
      .map((n) => `[${n.item_id}] ${n.content}`)
      .join("\n")
      .slice(0, 12000);
    const attsText = (atts ?? [])
      .map((a) => `[${a.item_id}] ${a.kind}: ${a.title || a.url}`)
      .join("\n")
      .slice(0, 4000);

    const profileBlock = (notesText || attsText)
      ? `LEARNER NOTES:\n${notesText}\n\nLEARNER LINKS/FILES:\n${attsText}`
      : "The learner has not added any notes yet. Use a broad mix of pillars: Data Science, Real Estate, Fitness Coaching, Spirituality, Languages, Investing, Communication, Creativity.";

    const today = new Date().toISOString().slice(0, 10);
    const target = kind === "event"
      ? `real-world EVENTS (conferences, workshops, meetups, hackathons, retreats, summits) happening within the next 6 months from ${today}`
      : `OPPORTUNITIES (grants, fellowships, scholarships, competitions, open calls, accelerators, paid programs) with deadlines in the next 6 months from ${today}`;

    const systemPrompt = `You are a personal scout for a polymath learner. Use Google Search to find CURRENT, REAL ${target} that match their learning trajectory.

Return ONLY a JSON array (no prose, no markdown fences) of 8-12 items. Each item:
{
  "title": string,
  "url": string (real working URL),
  "date_text": string (date or deadline, human-readable),
  "reason": string (1-2 sentences explaining why it matches THIS learner based on their notes),
  "source": string (publisher / hosting org)
}

Prioritize variety across their interests. Avoid duplicates. Only include items with verifiable URLs from your search.`;

    const userPrompt = `${profileBlock}\n\nFind ${target}. Return JSON array only.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
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
      if (aiRes.status === 429) return json({ error: "Rate limit, please try again in a moment." }, 429);
      if (aiRes.status === 402) return json({ error: "AI credits exhausted. Add credits in workspace settings." }, 402);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiJson = await aiRes.json();
    const content: string = aiJson.choices?.[0]?.message?.content ?? "";

    // Strip code fences if any
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    let items: Array<{ title: string; url?: string; date_text?: string; reason?: string; source?: string }> = [];
    try {
      // Try to find JSON array in the text
      const match = cleaned.match(/\[[\s\S]*\]/);
      items = JSON.parse(match ? match[0] : cleaned);
    } catch (e) {
      console.error("Parse fail", e, cleaned.slice(0, 500));
      return json({ error: "Could not parse AI response", raw: cleaned.slice(0, 1000) }, 500);
    }

    // Replace existing recommendations of this kind
    await supabase.from("recommendations").delete().eq("kind", kind);

    const rows = items
      .filter((i) => i && i.title)
      .map((i) => ({
        kind,
        title: String(i.title).slice(0, 500),
        url: i.url ? String(i.url).slice(0, 1000) : null,
        date_text: i.date_text ? String(i.date_text).slice(0, 200) : null,
        reason: i.reason ? String(i.reason).slice(0, 1000) : null,
        source: i.source ? String(i.source).slice(0, 200) : null,
      }));

    if (rows.length > 0) {
      const { error: insErr } = await supabase.from("recommendations").insert(rows);
      if (insErr) console.error("insert err", insErr);
    }

    return json({ ok: true, count: rows.length });
  } catch (e) {
    console.error("personalized-feed error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
