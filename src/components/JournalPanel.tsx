import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const todayISO = () => new Date().toISOString().slice(0, 10);
const shiftDate = (d: string, days: number) => {
  const dt = new Date(d + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

type Entry = {
  entry_date: string;
  content: string;
  ai_analysis: string | null;
  ai_next_day: string | null;
  ai_draft: string | null;
  ai_tomorrow_plan: TomorrowPlan | null;
  analyzed_at: string | null;
};

type TomorrowPlan = {
  summary?: string;
  blocks?: Array<{ start: string; end: string; activity: string; focus: string }>;
  non_negotiables?: string[];
  watch_outs?: string[];
};

export function JournalPanel() {
  const [date, setDate] = useState<string>(todayISO());
  const [entry, setEntry] = useState<Entry | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [tomorrowNotes, setTomorrowNotes] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("journal_entries").select("*").eq("entry_date", date).maybeSingle();
      if (cancel) return;
      setEntry(data ?? null);
      setContent(data?.content ?? "");
    })();
    return () => { cancel = true; };
  }, [date]);

  const save = async () => {
    setSaving(true);
    const payload = { entry_date: date, content };
    const { error } = await supabase.from("journal_entries").upsert(payload, { onConflict: "entry_date" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    const { data } = await supabase.from("journal_entries").select("*").eq("entry_date", date).maybeSingle();
    setEntry(data ?? null);
  };

  const analyze = async () => {
    if (!content.trim()) { toast.error("Write what you did today first."); return; }
    setAnalyzing(true);
    if (!entry || entry.content !== content) await save();
    const { data, error } = await supabase.functions.invoke("journal-analyze", {
      body: { entry_date: date },
    });
    setAnalyzing(false);
    if (error || data?.error) { toast.error(error?.message || data?.error || "Analysis failed"); return; }
    toast.success("Analyzed");
    const { data: fresh } = await supabase.from("journal_entries").select("*").eq("entry_date", date).maybeSingle();
    setEntry(fresh ?? null);
  };

  const planTomorrow = async () => {
    setPlanning(true);
    if (!entry || entry.content !== content) await save();
    const { data, error } = await supabase.functions.invoke("plan-tomorrow", {
      body: { entry_date: date, tomorrow_notes: tomorrowNotes },
    });
    setPlanning(false);
    if (error || data?.error) { toast.error(error?.message || data?.error || "Plan failed"); return; }
    toast.success("Tomorrow planned");
    const { data: fresh } = await supabase.from("journal_entries").select("*").eq("entry_date", date).maybeSingle();
    setEntry(fresh as Entry ?? null);
  };

  const isToday = date === todayISO();

  return (
    <div className="border border-border rounded-xl bg-card/40 p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl">Daily Journal</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setDate(shiftDate(date, -1))}><ChevronLeft size={16} /></Button>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border border-border rounded-md px-2 py-1 text-xs"
          />
          <Button variant="ghost" size="icon" onClick={() => isToday ? null : setDate(shiftDate(date, 1))} disabled={isToday}><ChevronRight size={16} /></Button>
        </div>
      </div>

      <Textarea
        rows={6}
        placeholder="Account for your whole day. What did you do, hour by hour? What did you learn? Where did time go?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving} variant="outline" size="sm">
          {saving ? <Loader2 className="animate-spin" /> : "Save"}
        </Button>
        <Button onClick={analyze} disabled={analyzing} size="sm" className="bg-gold text-ink hover:bg-gold/90">
          {analyzing ? <><Loader2 className="animate-spin" /> Analyzing…</> : <><Sparkles size={14} /> Analyze with AI</>}
        </Button>
      </div>

      {entry?.ai_analysis && (
        <div className="grid gap-3 pt-2 border-t border-border">
          <Block label="Analysis" body={entry.ai_analysis} />
          {entry.ai_next_day && <Block label="Plan for tomorrow" body={entry.ai_next_day} />}
          {entry.ai_draft && <Block label="Who you're becoming" body={entry.ai_draft} accent />}
        </div>
      )}
    </div>
  );
}

function Block({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div>
      <div className={`text-[10px] uppercase tracking-widest mb-1 ${accent ? "text-gold" : "text-muted-foreground"}`}>{label}</div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
    </div>
  );
}
