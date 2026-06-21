import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TrackView } from "@/components/analytics/TrackView";
import { Badge } from "@/components/ui/Badge";
import { RatingPill } from "@/components/ui/RatingPill";
import { CommunitySection } from "@/components/community/CommunitySection";
import { BoothLineReports } from "@/components/booth/BoothLineReports";
import { demoEvent } from "@/lib/demo/events";
import { getBoothById } from "@/lib/demo/booths";
import { getSwagForBooth } from "@/lib/demo/swag";
import { getPublishedStrategies } from "@/lib/demo/strategies";
import type { Availability } from "@/types/demo";

type BoothDetailPageProps = {
  params: Promise<{ slug: string; boothId: string }>;
};

function availabilityTone(availability: Availability): "warning" | "paid" | "free" | "neutral" {
  switch (availability) {
    case "gone":
      return "warning";
    case "limited":
      return "paid";
    case "available":
      return "free";
    default:
      return "neutral";
  }
}

export default async function BoothDetailPage({ params }: BoothDetailPageProps) {
  const { slug, boothId } = await params;
  const booth = getBoothById(boothId);
  if (slug !== demoEvent.slug || !booth) {
    notFound();
  }

  const swagOffers = getSwagForBooth(boothId);
  const relatedStrategies = getPublishedStrategies().filter((strategy) =>
    strategy.steps.some((step) => step.boothId === booth.id)
  );

  return (
    <AppShell
      title={booth.name}
      subtitle={`${booth.sponsorName} · #${booth.boothNumber}`}
      backHref={`/events/${slug}/booths`}
    >
      <TrackView name="booth_viewed" metadata={{ boothId }} />

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {booth.adminVerified ? <Badge tone="verified">Verified</Badge> : null}
          <Badge tone="neutral">{booth.category}</Badge>
        </div>
        <p className="text-sm text-zinc-700 break-words">{booth.description}</p>
        {booth.officialUrl ? (
          <a
            href={booth.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-medium text-cyan-700 underline underline-offset-2 break-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Visit official site
          </a>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800">Swag offers</h2>
        {swagOffers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            No swag offers listed for this booth yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {swagOffers.map((offer) => (
              <li
                key={offer.id}
                className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-800 break-words">{offer.itemName}</p>
                  <Badge tone={availabilityTone(offer.availability)}>
                    <span className="capitalize">{offer.availability}</span>
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">{offer.itemType}</p>
                <p className="text-xs text-zinc-600 break-words">
                  <span className="font-medium text-zinc-700">Requires:</span> {offer.requirement}
                </p>
                <div className="flex flex-wrap gap-2">
                  <RatingPill label="Value" level={offer.estimatedValue} />
                  <RatingPill label="Hassle" level={offer.hassleLevel} invert />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-800">Requirements &amp; fallback</h2>
        <p className="text-sm text-zinc-700 break-words">
          <span className="font-medium text-zinc-600">Requirement:</span> {booth.requirement}
        </p>
        <p className="text-sm text-zinc-700 break-words">
          <span className="font-medium text-zinc-600">Fallback:</span> {booth.fallbackNote}
        </p>
      </section>

      <BoothLineReports boothId={booth.id} />

      {relatedStrategies.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-800">Related strategies</h2>
          <ul className="space-y-2">
            {relatedStrategies.map((strategy) => (
              <li key={strategy.id}>
                <Link
                  href={`/events/${slug}/strategies/${strategy.id}`}
                  className="flex min-h-11 items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 active:bg-zinc-50"
                >
                  {strategy.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800">Community</h2>
        <CommunitySection
          targetType="booth"
          targetId={booth.id}
          likes={0}
          dislikes={0}
          reportType="booth"
        />
      </section>
    </AppShell>
  );
}
