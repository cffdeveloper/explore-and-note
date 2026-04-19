import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory } from "@/lib/blueprint-data";
import { SiteHeader } from "@/components/SiteHeader";
import { ItemCard } from "@/components/ItemCard";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => {
    const cat = loaderData?.cat;
    if (!cat) return { meta: [{ title: "Not found" }] };
    return {
      meta: [
        { title: `${cat.title} — The Blueprint` },
        { name: "description", content: cat.intro.slice(0, 150) },
        { property: "og:title", content: `${cat.title} — The Blueprint` },
        { property: "og:description", content: cat.intro.slice(0, 150) },
      ],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="mb-4">Category not found.</p>
        <Link to="/" className="text-gold hover:underline">← Back home</Link>
      </div>
    </div>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-gold mb-6">
            <ChevronLeft size={14} /> All pillars
          </Link>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">{cat.number}</div>
          <h1 className="text-4xl lg:text-5xl font-display font-semibold mb-4 leading-tight">{cat.title}</h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">{cat.intro}</p>
        </div>
      </section>

      {/* Sections */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12 space-y-16">
        {cat.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <div className="flex items-baseline gap-3 mb-6 pb-3 border-b border-border">
              <span className="font-display text-gold text-lg">{section.id}</span>
              <h2 className="text-2xl font-display font-semibold">{section.title}</h2>
            </div>

            <div className="space-y-8">
              {section.subs.map((sb) => (
                <div key={sb.id}>
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="w-6 h-px bg-gold" />
                    {sb.title}
                  </h3>
                  <div className="space-y-2">
                    {sb.items.map((item) => (
                      <ItemCard key={item.id} itemId={item.id} label={item.label} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-gold">← Back to The Blueprint</Link>
      </footer>
    </div>
  );
}
