import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, RefreshCw, Loader2, Sparkles, BookOpen, GraduationCap, Video, FileText, Wrench, Users, Globe } from "lucide-react";
import { toast } from "sonner";

type Link = { title: string; url: string; kind: string; blurb: string };
type Cache = { overview: string; links: Link[]; refreshed_at: string };

const KIND_ICON: Record<string, typeof BookOpen> = {
  article: FileText, course: GraduationCap, video: Video, paper: FileText,
  book: BookOpen, tool: Wrench, community: Users, docs: Globe, publication: BookOpen,
};

export function LinksPanel({ itemId, label }: { itemId: string; label: string }) {
  const [data, setData] = useState<Cache | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async (force = false) => {
    if (force) setGenerating(true);
    const { data: cached } = await supabase
      .from("topic_links").select("overview, links, refreshed_at").eq("item_id", itemId).maybeSingle();

    const stale = !cached || (Date.now() - new Date(cached.refreshed_at).getTime()) > 7 * 86400000;

    if (cached && !force) {
      setData(cached as Cache);
      setLoading(false);
    }

    if (force || !cached || stale) {
      const { data: res, error } = await supabase.functions.invoke("topic-links", {
        body: { item_id: itemId, label, force },
      });
      if (error || res?.error) {
        if (!cached) toast.error(error?.message || res?.error || "Failed to fetch links");
      } else {
        setData({ overview: res.overview, links: res.links, refreshed_at: res.refreshed_at });
      }
    }
    setLoading(false);
    setGenerating(false);
  };

  useEffect(() => {
    setData(null); setLoading(true);
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  return (
    <div className="border border-border rounded-xl bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-gold" />
          <span className="text-[10px] uppercase tracking-widest text-gold">AI-curated resources</span>
        </div>
        <button
          onClick={() => load(true)}
          disabled={generating}
          className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {generating ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {loading && !data ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          <Loader2 className="animate-spin inline mr-2" size={14} />Pulling links from across the web…
        </div>
      ) : data ? (
        <>
          {data.overview && <p className="text-sm text-muted-foreground italic">{data.overview}</p>}
          <div className="grid gap-1.5">
            {data.links.map((l, i) => {
              const Icon = KIND_ICON[l.kind] ?? Globe;
              return (
                <a
                  key={i} href={l.url} target="_blank" rel="noreferrer noopener"
                  className="group flex gap-2 items-start p-2 rounded border border-border bg-card/60 hover:border-gold transition-colors"
                >
                  <Icon size={14} className="text-gold mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium truncate">
                      <span className="truncate group-hover:text-gold">{l.title}</span>
                      <ExternalLink size={10} className="opacity-50 flex-shrink-0" />
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-2">{l.blurb}</div>
                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-0.5">{l.kind}</div>
                  </div>
                </a>
              );
            })}
          </div>
          <div className="text-[9px] text-muted-foreground/60 text-right">
            updated {new Date(data.refreshed_at).toLocaleDateString()}
          </div>
        </>
      ) : (
        <div className="text-xs text-muted-foreground text-center py-4">No links yet.</div>
      )}
    </div>
  );
}
