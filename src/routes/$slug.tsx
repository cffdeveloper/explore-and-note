import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getCategory, type Category } from "@/lib/blueprint-data";
import { SiteHeader } from "@/components/SiteHeader";
import { PillarSidebar } from "@/components/PillarSidebar";
import { AttachmentsPanel } from "@/components/AttachmentsPanel";
import { useState } from "react";

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
  const { cat } = Route.useLoaderData() as { cat: Category };
  const [selected, setSelected] = useState<{ id: string; label: string }>({
    id: cat.slug,
    label: cat.title,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="flex-1 flex flex-col lg:flex-row">
        <PillarSidebar
          cat={cat}
          selectedId={selected.id}
          onSelect={(id, label) => setSelected({ id, label })}
        />

        <main className="flex-1 min-w-0">
          {selected.id === cat.slug ? (
            <PillarOverview cat={cat} />
          ) : (
            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
              <AttachmentsPanel itemId={selected.id} label={selected.label} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function PillarOverview({ cat }: { cat: Category }) {
  return (
    <>
      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-3">{cat.number}</div>
          <h1 className="text-3xl lg:text-5xl font-display font-semibold mb-4 leading-tight">{cat.title}</h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">{cat.intro}</p>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <AttachmentsPanel itemId={cat.slug} label={`${cat.title} — Overview`} />
        <p className="text-xs text-muted-foreground mt-8 italic">
          Tip: pick any topic, subtopic, or sub-sub-skill from the left to add notes & files at that level.
        </p>
      </div>
    </>
  );
}
