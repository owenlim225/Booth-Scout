import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TrackView } from "@/components/analytics/TrackView";
import { BoothCard } from "@/components/booth/BoothCard";
import { demoEvent } from "@/lib/demo/events";
import { demoBooths } from "@/lib/demo/booths";
import type { Booth } from "@/types/demo";

type BoothsPageProps = {
  params: Promise<{ slug: string }>;
};

function groupByCategory(booths: Booth[]): [string, Booth[]][] {
  const groups = new Map<string, Booth[]>();
  for (const booth of booths) {
    const current = groups.get(booth.category) ?? [];
    groups.set(booth.category, [...current, booth]);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export default async function BoothsPage({ params }: BoothsPageProps) {
  const { slug } = await params;
  if (slug !== demoEvent.slug) {
    notFound();
  }

  const grouped = groupByCategory(demoBooths);

  return (
    <AppShell title="Booths" subtitle={demoEvent.name} backHref={`/events/${slug}`}>
      <TrackView name="booth_viewed" metadata={{ list: true }} />
      <p className="text-sm text-zinc-600">
        {demoBooths.length} booths across {grouped.length} categories. Tap a booth for swag, line
        reports, and requirements.
      </p>
      {grouped.map(([category, booths]) => (
        <section key={category} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {category}
          </h2>
          <div className="space-y-3">
            {booths.map((booth) => (
              <BoothCard key={booth.id} booth={booth} eventSlug={slug} />
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
