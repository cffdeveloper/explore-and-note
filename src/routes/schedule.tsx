import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Daily Timetable" },
      { name: "description", content: "Your fixed daily timetable that the AI uses to evaluate every day and plan tomorrow." },
    ],
  }),
  component: SchedulePage,
});

type Block = {
  id: string;
  start_time: string;
  end_time: string;
  activity: string;
  category: string | null;
  sort_order: number;
};

const CATEGORIES = ["sleep","reset","health","data-science","public-policy","cff","reading","work","skills","planning","other"];

function SchedulePage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("schedule_blocks").select("*").order("sort_order", { ascending: true });
      setBlocks((data ?? []) as Block[]);
      setLoading(false);
    })();
  }, []);

  const update = (id: string, patch: Partial<Block>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addBlock = () => {
    setBlocks((bs) => [
      ...bs,
      {
        id: `new-${crypto.randomUUID()}`,
        start_time: "12:00",
        end_time: "13:00",
        activity: "New block",
        category: "other",
        sort_order: bs.length + 1,
      },
    ]);
  };

  const removeBlock = async (id: string) => {
    if (!id.startsWith("new-")) {
      await supabase.from("schedule_blocks").delete().eq("id", id);
    }
    setBlocks((bs) => bs.filter((b) => b.id !== id));
  };

  const saveAll = async () => {
    setSaving(true);
    const ordered = blocks.map((b, i) => ({ ...b, sort_order: i + 1 }));
    for (const b of ordered) {
      const trim = (s: string) => (s.length === 5 ? `${s}:00` : s);
      const payload = {
        start_time: trim(b.start_time),
        end_time: trim(b.end_time),
        activity: b.activity,
        category: b.category,
        sort_order: b.sort_order,
      };
      if (b.id.startsWith("new-")) {
        await supabase.from("schedule_blocks").insert(payload);
      } else {
        await supabase.from("schedule_blocks").update(payload).eq("id", b.id);
      }
    }
    const { data } = await supabase.from("schedule_blocks").select("*").order("sort_order", { ascending: true });
    setBlocks((data ?? []) as Block[]);
    setSaving(false);
    toast.success("Schedule saved");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-8 lg:py-12 space-y-6">
        <header className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Daily Operating System</div>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold">Your Schedule</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            The AI uses these blocks to evaluate every day's journal and to plan tomorrow around any events you tell it about. Edit freely — non-negotiables (sleep, workout, deep work) anchor the rest.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-10"><Loader2 className="animate-spin inline" /></div>
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="grid grid-cols-12 gap-2 items-center border border-border rounded-lg p-2 bg-card/40">
                <GripVertical size={14} className="col-span-1 text-muted-foreground/50" />
                <input
                  type="time" value={b.start_time.slice(0, 5)}
                  onChange={(e) => update(b.id, { start_time: e.target.value })}
                  className="col-span-2 bg-input border border-border rounded px-2 py-1 text-xs"
                />
                <input
                  type="time" value={b.end_time.slice(0, 5)}
                  onChange={(e) => update(b.id, { end_time: e.target.value })}
                  className="col-span-2 bg-input border border-border rounded px-2 py-1 text-xs"
                />
                <input
                  value={b.activity}
                  onChange={(e) => update(b.id, { activity: e.target.value })}
                  className="col-span-4 bg-input border border-border rounded px-2 py-1 text-sm"
                />
                <select
                  value={b.category ?? "other"}
                  onChange={(e) => update(b.id, { category: e.target.value })}
                  className="col-span-2 bg-input border border-border rounded px-2 py-1 text-xs"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => removeBlock(b.id)}
                  className="col-span-1 p-1.5 text-muted-foreground hover:text-destructive rounded justify-self-end"
                  aria-label="Remove block"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={addBlock} variant="outline" size="sm"><Plus size={14} /> Add block</Button>
          <Button onClick={saveAll} disabled={saving} size="sm" className="bg-gold text-ink hover:bg-gold/90">
            {saving ? <Loader2 className="animate-spin" /> : "Save schedule"}
          </Button>
        </div>
      </main>
    </div>
  );
}
