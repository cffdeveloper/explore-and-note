import { Link, useLocation } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/blueprint-data";
import { useState } from "react";
import { Menu, X, Sparkles, Compass, Timer } from "lucide-react";

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-md bg-gold flex items-center justify-center text-ink font-bold font-display">
              B
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-display text-base font-semibold">The Blueprint</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">10-Year Roadmap</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-1 flex-1 justify-center">
            {CATEGORIES.map((c) => {
              const active = location.pathname === `/${c.slug}`;
              return (
                <Link
                  key={c.slug}
                  to="/$slug"
                  params={{ slug: c.slug }}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? "bg-gold text-ink"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-[10px] opacity-60 mr-1">{c.number.split(" ")[1]}</span>
                  {c.title.split(" ")[0]}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <Link
              to="/journey"
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                location.pathname === "/journey" ? "bg-gold text-ink" : "border border-gold/40 text-gold hover:bg-gold/10"
              }`}
            >
              <Timer size={12} /> Journey
            </Link>
            <Link
              to="/events"
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                location.pathname === "/events" ? "bg-gold text-ink" : "border border-gold/40 text-gold hover:bg-gold/10"
              }`}
            >
              <Sparkles size={12} /> Events
            </Link>
            <Link
              to="/opportunities"
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                location.pathname === "/opportunities" ? "bg-gold text-ink" : "border border-gold/40 text-gold hover:bg-gold/10"
              }`}
            >
              <Compass size={12} /> Opportunities
            </Link>
          </div>

          <button
            className="xl:hidden p-2 rounded-md hover:bg-secondary"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="xl:hidden pb-4 grid grid-cols-1 sm:grid-cols-2 gap-1">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm hover:bg-secondary flex items-center gap-2"
              >
                <span className="text-[10px] uppercase tracking-widest text-gold">{c.number}</span>
                <span>{c.title}</span>
              </Link>
            ))}
            <Link to="/journey" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm border border-gold/40 text-gold flex items-center gap-2">
              <Timer size={14} /> Journey timer
            </Link>
            <Link to="/events" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm border border-gold/40 text-gold flex items-center gap-2">
              <Sparkles size={14} /> Events for me
            </Link>
            <Link to="/opportunities" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm border border-gold/40 text-gold flex items-center gap-2">
              <Compass size={14} /> Opportunities for me
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
