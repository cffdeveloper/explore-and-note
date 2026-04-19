import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/blueprint-data";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight } from "lucide-react";
import { getPillarIcon } from "@/lib/pillar-icons";
import heroImg from "@/assets/hero-polymath.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "The Blueprint — 10-Year Roadmap" },
      { name: "description", content: "3 Careers. 5 Skills. A decade of deliberate practice. Track notes, links, and files for every sub-skill." },
      { property: "og:title", content: "The Blueprint — 10-Year Roadmap" },
      { property: "og:description", content: "3 Careers. 5 Skills. A decade of deliberate practice." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
});

function Index() {
  const careers = CATEGORIES.filter((c) => c.kind === "career");
  const skills = CATEGORIES.filter((c) => c.kind === "skill");

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroImg}
          alt="Renaissance polymath surrounded by astrolabes and constellations"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 text-gold text-xs uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Age 20 → 30 · Kenya
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-semibold leading-[1.05] mb-6">
              The <span className="text-gold">Blueprint</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground font-display italic mb-8">
              A 10-year master roadmap to building 3 careers & financial freedom by 30.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
              Eight pillars. Hundreds of sub-skills. Every leaf is a place to drop notes, links, files and images as you learn.
            </p>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-3xl font-display font-semibold">The Three Careers</h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Compounding</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {careers.map((c, i) => (
            <CategoryCard key={c.slug} c={c} index={i + 1} />
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-3xl font-display font-semibold">The Five Skills</h2>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Multipliers</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((c, i) => (
            <CategoryCard key={c.slug} c={c} index={i + 1} />
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border bg-card/30">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-16 text-center">
          <h3 className="text-xs uppercase tracking-widest text-gold mb-4">The Mission</h3>
          <p className="text-2xl lg:text-3xl font-display italic leading-snug">
            "You are 20 years old. You have a decade. The work compounds — show up daily."
          </p>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Built for deliberate practice. Notes, links and files autosave.
      </footer>
    </div>
  );
}

function CategoryCard({ c, index }: { c: typeof CATEGORIES[number]; index: number }) {
  const totalItems = c.sections.reduce(
    (acc, s) => acc + s.subs.reduce((a, sb) => a + sb.items.length, 0),
    0
  );
  const icon = getPillarIcon(c.slug);
  return (
    <Link
      to="/$slug"
      params={{ slug: c.slug }}
      className="group relative border border-border rounded-xl p-6 bg-card/40 hover:bg-card hover:border-gold/60 transition-all overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/5 group-hover:bg-gold/10 transition-colors" />
      {icon && (
        <img
          src={icon}
          alt=""
          aria-hidden
          loading="lazy"
          width={120}
          height={120}
          className="absolute -bottom-4 -right-4 w-28 h-28 object-contain opacity-30 group-hover:opacity-60 transition-opacity"
        />
      )}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-gold font-medium">{c.number}</span>
          <span className="font-display text-3xl text-muted-foreground/30 group-hover:text-gold/40 transition-colors">
            {String(index).padStart(2, "0")}
          </span>
        </div>
        {icon && (
          <img
            src={icon}
            alt={`${c.title} emblem`}
            loading="lazy"
            width={56}
            height={56}
            className="w-14 h-14 object-contain mb-3 drop-shadow-[0_0_20px_color-mix(in_oklab,var(--gold)_30%,transparent)]"
          />
        )}
        <h3 className="text-xl font-display font-semibold mb-2 leading-snug">{c.title}</h3>
        <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{c.short}</p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{totalItems} items</span>
          <span className="text-gold flex items-center gap-1 group-hover:gap-2 transition-all">
            Open <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
