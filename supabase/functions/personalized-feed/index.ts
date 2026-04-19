// Edge function: personalized-feed
// Reads notes + attachment titles, asks Gemini (with Google Search grounding)
// to find current real-world events or opportunities matching the learner.
// EVENTS = repository: appended via upsert, dedupe on (kind, url), nothing deleted.
// OPPORTUNITIES = deep intel: positioning, exact next actions, money angle, outreach drafts.

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
    const body = await req.json().catch(() => ({}));
    const kind = (body.kind ?? "event") as Kind;
    if (kind !== "event" && kind !== "opportunity") {
      return json({ error: "Invalid kind" }, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Build learner profile from notes + attachments
    const [{ data: notes }, { data: atts }] = await Promise.all([
      supabase.from("item_notes").select("item_id, content").not("content", "eq", ""),
      supabase.from("item_attachments").select("item_id, title, url, kind"),
    ]);

    const notesText = (notes ?? [])
      .map((n) => `[${n.item_id}] ${n.content}`)
      .join("\n")
      .slice(0, 14000);
    const attsText = (atts ?? [])
      .map((a) => `[${a.item_id}] ${a.kind}: ${a.title || a.url}`)
      .join("\n")
      .slice(0, 5000);

    const profileBlock = (notesText || attsText)
      ? `LEARNER NOTES:\n${notesText}\n\nLEARNER LINKS/FILES:\n${attsText}`
      : "Learner has not added notes yet. Use a broad mix across pillars: Data Science, Real Estate, Trading, Sales, Negotiation, Public Speaking, Law, Business.";

    const today = new Date().toISOString().slice(0, 10);

    let systemPrompt: string;
    let userPrompt: string;

    if (kind === "event") {
      systemPrompt = `You are a personal scout for a polymath learner age 20 in Kenya building careers in Data Science, Real Estate, Trading + 5 skills (Sales, Negotiation, Public Speaking, Law, Business).
Use Google Search to find CURRENT, REAL events (conferences, workshops, meetups, hackathons, retreats, summits, bootcamps) happening within the next 9 months from ${today}. Include both online and in-person. Prioritize ones the learner could realistically attend or join remotely.

Return ONLY a JSON array (no prose, no markdown fences) of 10-15 events. Each item:
{
  "title": string,
  "url": string (real working URL — verify via search),
  "date_text": string (human-readable date / window),
  "deadline_at": string (ISO 8601 date when event STARTS, best effort, e.g. "2026-05-12"),
  "pillar": string (one of: data-science, real-estate, trading, sales, negotiation, public-speaking, law, business, general),
  "reason": string (1-2 sentences: why THIS learner should care, tied to their notes),
  "source": string (host org)
}

Avoid repeats of well-known recurring events the learner likely already knows. Prefer fresh, specific, actionable picks.`;

      userPrompt = `${profileBlock}\n\nFind upcoming events. Return JSON array only.`;
    } else {
      systemPrompt = `You are an aggressive opportunity scout + positioning strategist for a polymath learner age 20 in Kenya.
Use Google Search across the public web — including X/Twitter posts, LinkedIn posts, Reddit, Hacker News, GitHub, news sites, public RFPs, grant pages, accelerator pages, fellowship pages, hiring pages, bounty platforms — to find CURRENT real opportunities where this learner can win money, influence, or leverage in the next 6 months.

For each opportunity, do not just list it — give intel like a McKinsey strategist: who they are, why they fit, the exact next 3 actions, the money angle, and a draft outreach message they can copy-paste.

Return ONLY a JSON array (no prose, no markdown fences) of 8-12 opportunities. Each item:
{
  "title": string,
  "url": string (real working URL),
  "date_text": string (deadline or window),
  "deadline_at": string (ISO 8601, best effort),
  "pillar": string (data-science | real-estate | trading | sales | negotiation | public-speaking | law | business | general),
  "source": string (org or platform),
  "reason": string (1 sentence: why this matches the learner specifically),
  "intel": {
    "positioning": string (how the learner should position themselves — 1-2 sentences),
    "actions": [string, string, string] (exactly 3 concrete next actions, imperative voice),
    "money_angle": string (how this leads to money — fee, retainer, equity, prize, leverage),
    "outreach_draft": string (a 2-4 sentence DM/email/application paragraph the learner can copy-paste, personalized using their notes)
  }
}

Be specific, contrarian, and high-leverage. No generic advice. Verify all URLs via search.`;

      userPrompt = `${profileBlock}\n\nFind high-leverage opportunities + give full intel. Return JSON array only.`;
    }

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
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

    let items: Array<Record<string, unknown>> = [];
    try {
      const match = cleaned.match(/\[[\s\S]*\]/);
      items = JSON.parse(match ? match[0] : cleaned);
    } catch (e) {
      console.error("Parse fail", e, cleaned.slice(0, 500));
      return json({ error: "Could not parse AI response", raw: cleaned.slice(0, 1000) }, 500);
    }

    const rows = items
      .filter((i) => i && typeof i.title === "string" && typeof i.url === "string" && i.url)
      .map((i) => {
        let deadline_at: string | null = null;
        if (typeof i.deadline_at === "string" && i.deadline_at) {
          const d = new Date(i.deadline_at);
          if (!isNaN(d.getTime())) deadline_at = d.toISOString();
        }
        return {
          kind,
          title: String(i.title).slice(0, 500),
          url: String(i.url).slice(0, 1000),
          date_text: i.date_text ? String(i.date_text).slice(0, 200) : null,
          deadline_at,
          pillar: i.pillar ? String(i.pillar).slice(0, 50) : null,
          reason: i.reason ? String(i.reason).slice(0, 1000) : null,
          source: i.source ? String(i.source).slice(0, 200) : null,
          intel: kind === "opportunity" && i.intel && typeof i.intel === "object" ? i.intel : null,
        };
      });

    let inserted = 0;
    if (rows.length > 0) {
      // Upsert on (kind, url) — dedupes silently, refreshes intel/dates if AI returns same URL
      const { error: upErr, count } = await supabase
        .from("recommendations")
        .upsert(rows, { onConflict: "kind,url", count: "exact" });
      if (upErr) console.error("upsert err", upErr);
      inserted = count ?? rows.length;
    }

    return json({ ok: true, count: inserted, returned: rows.length });
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
