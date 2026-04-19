// Edge function: parse an uploaded attachment with Gemini multimodal,
// returns a concise summary + key takeaways. Stored on the attachment row.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { attachment_id } = (await req.json()) as { attachment_id: string };
    if (!attachment_id) return json({ error: "attachment_id required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: att } = await supabase
      .from("item_attachments").select("*").eq("id", attachment_id).maybeSingle();
    if (!att) return json({ error: "attachment not found" }, 404);

    // Fetch the file
    const fileRes = await fetch(att.url);
    if (!fileRes.ok) return json({ error: "failed to fetch file" }, 500);
    const buf = await fileRes.arrayBuffer();
    const bytes = new Uint8Array(buf);

    const mime = att.mime_type || fileRes.headers.get("content-type") || "application/octet-stream";

    let userContent: unknown;
    if (mime.startsWith("image/") || mime === "application/pdf") {
      // base64 for multimodal
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const b64 = btoa(bin);
      userContent = [
        { type: "text", text: `Summarize this ${mime.startsWith("image/") ? "image" : "PDF"} ("${att.title || "untitled"}") in 4-7 bullet key takeaways for a polymath learner. End with one "why this matters" line.` },
        { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
      ];
    } else if (mime.startsWith("text/") || mime.includes("json") || mime.includes("xml") || mime.includes("csv") || mime.includes("markdown")) {
      const text = new TextDecoder().decode(bytes).slice(0, 60000);
      userContent = `File: ${att.title}\nMIME: ${mime}\n\n---\n${text}\n---\n\nSummarize in 4-7 bullet key takeaways for a polymath learner. End with one "why this matters" line.`;
    } else {
      return json({ error: `Unsupported MIME type for parsing: ${mime}` }, 400);
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a concise study assistant. Output plain bullets, no markdown headers, no preamble." },
          { role: "user", content: userContent },
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
    const summary: string = aiJson.choices?.[0]?.message?.content?.trim() ?? "";

    // Append to existing note for this item_id
    const { data: existing } = await supabase
      .from("item_notes").select("content").eq("item_id", att.item_id).maybeSingle();
    const header = `\n\n--- AI summary of "${att.title}" (${new Date().toLocaleDateString()}) ---\n`;
    const merged = (existing?.content ?? "") + header + summary;
    await supabase.from("item_notes").upsert(
      { item_id: att.item_id, content: merged },
      { onConflict: "item_id" },
    );

    return json({ ok: true, summary });
  } catch (e) {
    console.error("parse-attachment error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
