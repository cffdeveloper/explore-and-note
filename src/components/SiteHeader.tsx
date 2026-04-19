import { Link, useLocation } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/blueprint-data";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-md bg-gold flex items-center justify-center text-ink font-bold font-display">
              B
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">The Blueprint</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">10-Year Roadmap</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {CATEGORIES.map((c) => {
              const active = location.pathname.startsWith(`/${c.slug}`);
              return (
                <Link
                  key={c.slug}
                  to="/$slug"
                  params={{ slug: c.slug }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
          </div>
        )}
      </div>
    </header>
  );
}
