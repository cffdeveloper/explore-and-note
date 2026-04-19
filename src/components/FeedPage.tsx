import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Sparkles, Compass, RefreshCw, ExternalLink, Loader2, Calendar } from "lucide-react";

type Rec = {
  id: string;
  kind: "event" | "opportunity";
  title: string;
  url: string | null;
  date_text: string | null;
  reason: string | null;
  source: string | null;
  created_at: string;
};

export function FeedPage({ kind }: { kind: "event" | "opportunity" }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("kind", kind)
      .order("created_at", { ascending: false });
    setRecs((data ?? []) as Rec[]);
    setLastUpdated(data?.[0]?.created_at ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [kind]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("personalized-feed", {
        body: { kind },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const isEvent = kind === "event";
  const Icon = isEvent ? Sparkles : Compass;
  const title = isEvent ? "Events for you" : "Opportunities for you";
  const subtitle = isEvent
    ? "Live, AI-scouted events matching your learning across all 8 pillars."
    : "Grants, fellowships, competitions, and open calls picked for your trajectory.";

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold mb-3">
            <Icon size={14} /> Personalized by Gemini
          </div>
          <h1 className="text-3xl lg:text-5xl font-display font-semibold mb-3 leading-tight">{title}</h1>
          <p className="text-base text-muted-foreground max-w-3xl mb-6">{subtitle}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={generate}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-gold text-ink px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              {generating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {generating ? "Scouting the web…" : recs.length === 0 ? "Generate my feed" : "Refresh"}
            </button>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
          {error && (
            <div className="mt-4 text-sm text-destructive border border-destructive/40 rounded-md px-3 py-2 bg-destructive/10">
              {error}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin" />
          </div>
        ) : recs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Icon size={32} className="mx-auto text-gold mb-3" />
            <p className="text-muted-foreground mb-1">No {kind}s yet.</p>
            <p className="text-xs text-muted-foreground">Click "Generate my feed" — the AI will read your notes and search the web.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recs.map((r) => (
              <article key={r.id} className="border border-border rounded-lg p-5 bg-card/40 hover:bg-card/70 hover:border-gold/40 transition-all flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-lg font-semibold leading-snug">{r.title}</h3>
                </div>
                {r.date_text && (
                  <div className="flex items-center gap-1.5 text-xs text-gold mb-2">
                    <Calendar size={11} /> {r.date_text}
                  </div>
                )}
                {r.reason && <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1">{r.reason}</p>}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-auto">
                  {r.source && <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{r.source}</span>}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs text-gold hover:underline flex-shrink-0"
                    >
                      Open <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
