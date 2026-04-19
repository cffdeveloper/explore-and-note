import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { CountdownTimer } from "@/components/CountdownTimer";
import { JournalPanel } from "@/components/JournalPanel";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "The Journey — 10-Year Timer & Daily Journal" },
      { name: "description", content: "Unpausable 10-year countdown plus a daily journal that AI uses to track your growth." },
    ],
  }),
  component: JourneyPage,
});

type Journey = { id: string; started_at: string; duration_years: number };

function JourneyPage() {
  const [j, setJ] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("journey").select("*").order("started_at", { ascending: true }).limit(1).maybeSingle();
      setJ(data as Journey | null);
      setLoading(false);
    })();
  }, []);

  const start = async () => {
    setStarting(true);
    const { data, error } = await supabase.from("journey").insert({}).select().single();
    setStarting(false);
    if (error) { toast.error(error.message); return; }
    setJ(data as Journey);
    toast.success("The decade has begun. No pause from here.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="max-w-5xl mx-auto w-full px-4 lg:px-8 py-8 lg:py-12 space-y-8">
        <header className="text-center space-y-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold">The Decade</div>
          <h1 className="text-3xl lg:text-5xl font-display font-semibold">10 Years. Unpausable.</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Once started, the timer cannot be paused, reset, or stopped. Account for every day. The AI watches your notes, files, and journal to tell you where to adjust.
          </p>
        </header>

        {loading ? (
          <div className="text-center"><Loader2 className="animate-spin inline" /></div>
        ) : j ? (
          <>
            <CountdownTimer startedAt={j.started_at} durationYears={j.duration_years} />
            <p className="text-center text-xs text-muted-foreground">
              Started {new Date(j.started_at).toLocaleString()} · ends in {j.duration_years} years
            </p>
            <JournalPanel />
          </>
        ) : (
          <div className="border border-gold/40 rounded-xl bg-card/40 p-8 text-center space-y-5">
            <AlertTriangle className="mx-auto text-gold" size={32} />
            <p className="text-base">
              Pressing <strong>Start the Decade</strong> begins a 10-year countdown that <strong>cannot be paused, reset, or undone</strong>.
            </p>
            {!confirming ? (
              <Button onClick={() => setConfirming(true)} size="lg" className="bg-gold text-ink hover:bg-gold/90">
                Start the Decade
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gold">Are you sure? This is permanent.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button>
                  <Button onClick={start} disabled={starting} className="bg-gold text-ink hover:bg-gold/90">
                    {starting ? <Loader2 className="animate-spin" /> : "Yes — start now"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
