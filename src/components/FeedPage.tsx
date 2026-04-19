import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORIES } from "@/lib/blueprint-data";
import { getPillarIcon } from "@/lib/pillar-icons";
import { Sparkles, Compass, RefreshCw, ExternalLink, Loader2, Calendar, Target, Coins, MessageSquareQuote, ArrowRightCircle, ChevronDown } from "lucide-react";

type Rec = {
  id: string;
  kind: "event" | "opportunity";
  title: string;
  url: string | null;
  date_text: string | null;
  deadline_at: string | null;
  pillar: string | null;
  reason: string | null;
  source: string | null;
  intel: {
    positioning?: string;
    actions?: string[];
    money_angle?: string;
    outreach_draft?: string;
  } | null;
  created_at: string;
};

type Sort = "soonest" | "newest";

export function FeedPage({ kind }: { kind: "event" | "opportunity" }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("soonest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recommendations")
      .select("*")
      .eq("kind", kind)
      .order("created_at", { ascending: false })
      .limit(500);
    setRecs((data ?? []) as unknown as Rec[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [kind]);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("personalized-feed", { body: { kind } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    let list = recs;
    if (pillarFilter !== "all") list = list.filter((r) => r.pillar === pillarFilter);
    if (sort === "soonest") {
      list = [...list].sort((a, b) => {
        const ad = a.deadline_at ? new Date(a.deadline_at).getTime() : Infinity;
        const bd = b.deadline_at ? new Date(b.deadline_at).getTime() : Infinity;
        // Past deadlines sort to bottom
        const aPast = ad < now ? 1 : 0;
        const bPast = bd < now ? 1 : 0;
        if (aPast !== bPast) return aPast - bPast;
        return ad - bd;
      });
    } else {
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [recs, pillarFilter, sort]);

  const lastUpdated = recs[0]?.created_at ?? null;
  const isEvent = kind === "event";
  const Icon = isEvent ? Sparkles : Compass;
  const title = isEvent ? "Events for you" : "Opportunities for you";
  const subtitle = isEvent
    ? "A growing repository — refreshes hourly from Google Search via Gemini. Old events stay; sort by soonest."
    : "Deep positioning intel. Each opportunity comes with exact next actions, the money angle, and a copy-paste outreach draft.";

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 py-10 lg:py-14">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold mb-3">
            <Icon size={14} /> Personalized by Gemini · grounded in your notes
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
              {generating ? "Scouting the web…" : recs.length === 0 ? "Generate my feed" : "Refresh now"}
            </button>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Last add: {new Date(lastUpdated).toLocaleString()} · {recs.length} in repository
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

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <FilterChip active={pillarFilter === "all"} onClick={() => setPillarFilter("all")}>
            All pillars
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.slug} active={pillarFilter === c.slug} onClick={() => setPillarFilter(c.slug)}>
              <img src={getPillarIcon(c.slug)} alt="" className="w-4 h-4 object-contain mr-1.5" />
              {c.title.split(" ")[0]}
            </FilterChip>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <FilterChip active={sort === "soonest"} onClick={() => setSort("soonest")}>Soonest</FilterChip>
          <FilterChip active={sort === "newest"} onClick={() => setSort("newest")}>Newest added</FilterChip>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <Icon size={32} className="mx-auto text-gold mb-3" />
            <p className="text-muted-foreground mb-1">{recs.length === 0 ? `No ${kind}s yet.` : "No matches for this filter."}</p>
            <p className="text-xs text-muted-foreground">
              {recs.length === 0 ? `Click "Generate my feed" — the AI will read your notes and search the web.` : "Try a different pillar."}
            </p>
          </div>
        ) : (
          <div className={kind === "opportunity" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
            {filtered.map((r) => (
              <RecCard
                key={r.id}
                r={r}
                expanded={expandedId === r.id}
                onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
        active ? "bg-gold text-ink border-gold" : "border-border text-muted-foreground hover:text-foreground hover:border-gold/40"
      }`}
    >
      {children}
    </button>
  );
}

function RecCard({ r, expanded, onToggle }: { r: Rec; expanded: boolean; onToggle: () => void }) {
  const icon = r.pillar ? getPillarIcon(r.pillar) : undefined;
  const isPast = r.deadline_at && new Date(r.deadline_at).getTime() < Date.now();
  const hasIntel = r.kind === "opportunity" && r.intel && (r.intel.positioning || r.intel.actions?.length);

  return (
    <article className={`border border-border rounded-lg p-5 bg-card/40 hover:bg-card/70 hover:border-gold/40 transition-all ${isPast ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <img src={icon} alt="" className="w-12 h-12 object-contain flex-shrink-0 hidden sm:block" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display text-lg font-semibold leading-snug">{r.title}</h3>
            {isPast && <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex-shrink-0">Past</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
            {r.date_text && (
              <span className="flex items-center gap-1.5 text-gold">
                <Calendar size={11} /> {r.date_text}
              </span>
            )}
            {r.pillar && r.pillar !== "general" && (
              <span className="uppercase tracking-widest text-[10px]">{r.pillar.replace("-", " ")}</span>
            )}
            {r.source && <span className="truncate">{r.source}</span>}
          </div>
          {r.reason && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{r.reason}</p>}

          <div className="flex items-center gap-3 flex-wrap">
            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                Open <ExternalLink size={11} />
              </a>
            )}
            {hasIntel && (
              <button onClick={onToggle} className="inline-flex items-center gap-1 text-xs text-gold/80 hover:text-gold">
                {expanded ? "Hide intel" : "Show full intel"}
                <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>

          {hasIntel && expanded && r.intel && (
            <div className="mt-4 pt-4 border-t border-border grid gap-3">
              {r.intel.positioning && (
                <IntelBlock icon={<Target size={13} />} label="Positioning">{r.intel.positioning}</IntelBlock>
              )}
              {r.intel.actions && r.intel.actions.length > 0 && (
                <IntelBlock icon={<ArrowRightCircle size={13} />} label="Next 3 actions">
                  <ol className="list-decimal list-inside space-y-1">
                    {r.intel.actions.map((a, i) => <li key={i}>{a}</li>)}
                  </ol>
                </IntelBlock>
              )}
              {r.intel.money_angle && (
                <IntelBlock icon={<Coins size={13} />} label="Money angle">{r.intel.money_angle}</IntelBlock>
              )}
              {r.intel.outreach_draft && (
                <IntelBlock icon={<MessageSquareQuote size={13} />} label="Outreach draft (copy-paste)">
                  <div className="relative">
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-background/40 border border-border rounded p-3">{r.intel.outreach_draft}</pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(r.intel?.outreach_draft || "")}
                      className="absolute top-2 right-2 text-[10px] text-gold hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </IntelBlock>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function IntelBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold mb-1.5">
        {icon} {label}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
