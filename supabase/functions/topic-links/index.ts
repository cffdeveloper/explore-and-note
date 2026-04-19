// Edge function: pull the best online resources for a topic node and cache them.
// Uses Gemini via Lovable AI Gateway, returns categorized links + a one-liner per link.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STALE_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { item_id, label, force } = (await req.json()) as {
      item_id: string;
      label: string;
      force?: boolean;
    };
    if (!item_id || !label) return json({ error: "item_id and label required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Cache check
    const { data: cached } = await supabase
      .from("topic_links")
      .select("*")
      .eq("item_id", item_id)
      .maybeSingle();

    if (!force && cached) {
      const ageMs = Date.now() - new Date(cached.refreshed_at).getTime();
      if (ageMs < STALE_DAYS * 24 * 60 * 60 * 1000) {
        return json({ ok: true, cached: true, ...cached });
      }
    }

    const systemPrompt = `You are a research librarian for a 20-year-old polymath on a deliberate 10-year plan across 8 pillars (data science, real estate, trading, sales, negotiation, law, public speaking, business). For a given topic, return the BEST real online resources someone would actually use.

Return STRICT JSON (no markdown fences):
{
  "overview": "1-2 sentences on why this topic matters and what to look for.",
  "links": [
    { "title": "...", "url": "https://...", "kind": "article|course|video|paper|book|tool|community|docs|publication", "blurb": "1 sentence on what it is and why it's useful." }
  ]
}

Rules:
- 10-15 links, mix of free and paid, mix of beginner and deep.
- Only real, well-known sources (arxiv, MIT OCW, Coursera, YouTube channels, Substacks, GitHub, Investopedia, BiggerPockets, Khan Academy, Harvard Business Review, official docs, etc.).
- NEVER fabricate URLs. If unsure of an exact URL, use the homepage of the source.
- "kind" must be one of the values listed above.`;

    const userPrompt = `TOPIC: ${label}
NODE ID: ${item_id}

Return the JSON now.`;

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

    let parsed: { overview?: string; links?: Array<Record<string, string>> };
    try {
      const m = cleaned.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(m ? m[0] : cleaned);
    } catch (e) {
      console.error("parse fail", e, cleaned.slice(0, 500));
      return json({ error: "Could not parse AI response" }, 500);
    }

    const overview = parsed.overview ?? "";
    const links = Array.isArray(parsed.links) ? parsed.links : [];

    const { data: upserted, error: upErr } = await supabase
      .from("topic_links")
      .upsert(
        {
          item_id,
          label,
          overview,
          links,
          refreshed_at: new Date().toISOString(),
        },
        { onConflict: "item_id" },
      )
      .select()
      .single();
    if (upErr) console.error("upsert err", upErr);

    return json({ ok: true, cached: false, ...(upserted ?? { overview, links }) });
  } catch (e) {
    console.error("topic-links error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
