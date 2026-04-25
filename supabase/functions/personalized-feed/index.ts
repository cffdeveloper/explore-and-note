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

    // Build deep learner profile: notes + attachments + journal + journey
    const [notesRes, attsRes, journalRes, journeyRes] = await Promise.all([
      supabase.from("item_notes").select("item_id, content, updated_at").not("content", "eq", "").order("updated_at", { ascending: false }).limit(200),
      supabase.from("item_attachments").select("item_id, title, url, kind, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("journal_entries").select("entry_date, content, ai_analysis, ai_draft").order("entry_date", { ascending: false }).limit(30),
      supabase.from("journey").select("started_at, duration_years").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const notes = notesRes.data ?? [];
    const atts = attsRes.data ?? [];
    const journal = journalRes.data ?? [];
    const journey = journeyRes.data;

    const notesText = notes.map((n) => `[${n.item_id}] ${n.content}`).join("\n").slice(0, 14000);
    const attsText = atts.map((a) => `[${a.item_id}] ${a.kind}: ${a.title || a.url}`).join("\n").slice(0, 5000);
    const journalText = journal.map((j) => `(${j.entry_date}) ${j.content}${j.ai_draft ? ` | becoming: ${j.ai_draft}` : ""}`).join("\n").slice(0, 8000);

    let journeyLine = "Journey not started yet.";
    if (journey?.started_at) {
      const startMs = new Date(journey.started_at).getTime();
      const elapsedDays = Math.floor((Date.now() - startMs) / 86400000);
      const totalDays = (journey.duration_years ?? 10) * 365;
      journeyLine = `Day ${elapsedDays} of ${totalDays} in a ${journey.duration_years ?? 10}-year polymath sprint (started ${journey.started_at.slice(0,10)}).`;
    }

    const hasAnyContext = notesText || attsText || journalText;
    const profileBlock = hasAnyContext
      ? `JOURNEY: ${journeyLine}\n\nDAILY JOURNAL (most recent first):\n${journalText || "(none yet)"}\n\nLEARNER NOTES:\n${notesText || "(none yet)"}\n\nLEARNER LINKS/FILES:\n${attsText || "(none yet)"}`
      : `JOURNEY: ${journeyLine}\n\nNo notes/journal yet. Use a broad mix across all 8 pillars: Data Science, Real Estate, Trading, Sales, Negotiation, Public Speaking, Law, Business.`;

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
  "pillar": string (one of: data-science, public-policy, cff, sales, negotiation, public-speaking, law, business, general),
  "reason": string (1-2 sentences: why THIS learner should care, tied to their notes),
  "source": string (host org)
}

Avoid repeats of well-known recurring events the learner likely already knows. Prefer fresh, specific, actionable picks.`;

      userPrompt = `${profileBlock}\n\nFind upcoming events. Return JSON array only.`;
    } else {
      systemPrompt = `You are an elite opportunity scout + positioning strategist + GAP ANALYST for a 20-year-old polymath in Kenya on a 10-year sprint across 8 pillars: Data Science, Real Estate, Trading, Sales, Negotiation, Public Speaking, Law, Business.

YOUR JOB has THREE layers, in this order:

1. DEEP READ — Study the learner's journey day-count, daily journal entries, notes, and uploaded files. Build a precise mental model: what they actually know, what they're working on this week, what they're avoiding, where their momentum is, where it's stalling.

2. GAP SCAN — Then scan the WHOLE relevant internet via Google Search (X/Twitter posts, LinkedIn posts, Reddit, Hacker News, GitHub, Product Hunt, news sites, public RFPs, grant pages, accelerator/fellowship pages, hiring pages, bounty platforms, Telegram/Discord communities, government tenders in Kenya/EAC, African VC announcements, prop trading firms, real estate syndication deals, legal-tech, sales SaaS, public speaking circuits like TEDx/Toastmasters open calls). Find CURRENT real opportunities (next 6 months) where this learner can capture money, influence, or compounding leverage.

3. SPOT THE GAPS — Critically: do NOT just match what the learner already does. Surface opportunities in adjacent industries and money flows they are NOT yet exploiting but COULD plausibly enter given their profile (e.g. if they journal about real estate but never about REITs/mortgage tech/Airbnb arbitrage — flag that gap). Cover ALL 8 pillars across the returned set; never let one pillar dominate.

For EACH opportunity give intel like a McKinsey strategist + an aggressive operator: positioning, exact next 3 actions, money angle, and a copy-paste outreach draft personalized using their journal/notes language.

Return ONLY a JSON array (no prose, no markdown fences) of 10-14 opportunities, balanced across pillars. Each item:
{
  "title": string,
  "url": string (real working URL — verify via search),
  "date_text": string (deadline or window),
  "deadline_at": string (ISO 8601, best effort),
  "pillar": string (data-science | public-policy | cff | sales | negotiation | public-speaking | law | business | general),
  "source": string (org or platform),
  "reason": string (1-2 sentences: why this matches THIS learner specifically — quote or paraphrase their notes/journal if possible; if it's a GAP they're missing, say "GAP:" and explain),
  "intel": {
    "positioning": string (how the learner should position themselves — 1-2 sentences),
    "actions": [string, string, string] (exactly 3 concrete next actions, imperative voice, doable this week),
    "money_angle": string (how this leads to money — fee, retainer, equity, prize, leverage, with rough $ band if reasonable),
    "outreach_draft": string (a 2-4 sentence DM/email/application paragraph they can copy-paste)
  }
}

Be specific, contrarian, high-leverage. No generic "join a community" advice. Verify all URLs via search. Refuse to repeat the same org twice.`;

      userPrompt = `${profileBlock}\n\nDo a deep contextual read, scan the web, and surface 10-14 opportunities — including 2-4 that target GAPS in industries/money flows the learner is currently ignoring. Return JSON array only.`;
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
