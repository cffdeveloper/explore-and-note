import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/lib/blueprint-data";
import { getPillarIcon } from "@/lib/pillar-icons";

type Props = {
  cat: Category;
  selectedId: string;
  onSelect: (id: string, label: string) => void;
};

export function PillarSidebar({ cat, selectedId, onSelect }: Props) {
  // sections expanded by default; subs collapsed
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(cat.sections.map((s) => s.id)));
  const [openSubs, setOpenSubs] = useState<Set<string>>(() => {
    // open the sub that contains selected
    const init = new Set<string>();
    for (const s of cat.sections) for (const sb of s.subs) {
      if (sb.id === selectedId || sb.items.some((i) => i.id === selectedId)) init.add(sb.id);
    }
    return init;
  });

  const toggle = (set: Set<string>, setter: (v: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setter(next);
  };

  return (
    <aside className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border bg-card/30">
      <div className="p-4 border-b border-border flex items-start gap-3">
        {getPillarIcon(cat.slug) && (
          <img
            src={getPillarIcon(cat.slug)}
            alt=""
            aria-hidden
            width={48}
            height={48}
            className="w-12 h-12 object-contain flex-shrink-0 drop-shadow-[0_0_12px_color-mix(in_oklab,var(--gold)_40%,transparent)]"
          />
        )}
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1">{cat.number}</div>
          <button
            onClick={() => onSelect(cat.slug, cat.title)}
            className={`text-left font-display text-base font-semibold leading-tight hover:text-gold transition-colors ${
              selectedId === cat.slug ? "text-gold" : ""
            }`}
          >
            {cat.title}
          </button>
        </div>
      </div>

      <nav className="p-2 space-y-1">
        {cat.sections.map((section) => {
          const sectionOpen = openSections.has(section.id);
          return (
            <div key={section.id}>
              <div className="flex items-center">
                <button
                  onClick={() => toggle(openSections, setOpenSections, section.id)}
                  className="p-1.5 hover:bg-secondary rounded text-muted-foreground"
                  aria-label="Toggle"
                >
                  <ChevronRight size={14} className={`transition-transform ${sectionOpen ? "rotate-90" : ""}`} />
                </button>
                <button
                  onClick={() => onSelect(section.id, section.title)}
                  className={`flex-1 text-left px-2 py-1.5 rounded text-sm font-medium hover:bg-secondary transition-colors ${
                    selectedId === section.id ? "bg-secondary text-gold" : ""
                  }`}
                >
                  <span className="text-gold/70 mr-1.5 text-xs">{section.id}</span>
                  {section.title}
                </button>
              </div>

              {sectionOpen && (
                <div className="ml-5 border-l border-border pl-1 mt-0.5 space-y-0.5">
                  {section.subs.map((sb) => {
                    const subOpen = openSubs.has(sb.id);
                    return (
                      <div key={sb.id}>
                        <div className="flex items-center">
                          <button
                            onClick={() => toggle(openSubs, setOpenSubs, sb.id)}
                            className="p-1 hover:bg-secondary rounded text-muted-foreground"
                            aria-label="Toggle"
                          >
                            <ChevronRight size={12} className={`transition-transform ${subOpen ? "rotate-90" : ""}`} />
                          </button>
                          <button
                            onClick={() => onSelect(sb.id, sb.title)}
                            className={`flex-1 text-left px-2 py-1 rounded text-xs hover:bg-secondary transition-colors ${
                              selectedId === sb.id ? "bg-secondary text-gold" : "text-muted-foreground"
                            }`}
                          >
                            {sb.title}
                          </button>
                        </div>

                        {subOpen && (
                          <div className="ml-4 border-l border-border pl-1 mt-0.5 space-y-0.5">
                            {sb.items.map((it) => (
                              <button
                                key={it.id}
                                onClick={() => onSelect(it.id, it.label)}
                                className={`block w-full text-left px-2 py-1 rounded text-xs hover:bg-secondary transition-colors ${
                                  selectedId === it.id ? "bg-secondary text-gold" : "text-muted-foreground/80"
                                }`}
                              >
                                {it.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
