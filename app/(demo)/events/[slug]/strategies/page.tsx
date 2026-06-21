import { notFound } from "next/navigation";
import { TrackView } from "@/components/analytics/TrackView";
import { AppShell } from "@/components/layout/AppShell";
import { StrategyBrowse } from "@/components/strategy/StrategyBrowse";
import { demoEvent } from "@/lib/demo/events";
import { getPublishedStrategies } from "@/lib/demo/strategies";

type Params = Promise<{ slug: string }>;

export default async function StrategiesPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (slug !== demoEvent.slug) {
    notFound();
  }

  const strategies = getPublishedStrategies();

  return (
    <AppShell title="Strategies" subtitle={demoEvent.name} backHref={`/events/${slug}`}>
      <TrackView name="strategy_preview_viewed" metadata={{ list: true }} />
      <StrategyBrowse strategies={strategies} eventSlug={slug} />
    </AppShell>
  );
}
