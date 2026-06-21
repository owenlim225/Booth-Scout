import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { WalletButton } from "@/components/layout/WalletButton";
import { TrackView } from "@/components/analytics/TrackView";
import { Badge } from "@/components/ui/Badge";
import { getEventBySlug } from "@/lib/demo/events";
import { demoBooths } from "@/lib/demo/booths";
import { demoSwagOffers } from "@/lib/demo/swag";
import { demoLineReports } from "@/lib/demo/line-reports";
import { getPublishedStrategies } from "@/lib/demo/strategies";

type Params = Promise<{ slug: string }>;

function formatEventDate(startsAt: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(startsAt));
}

export default async function EventPage({ params }: { params: Params }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const featured = getPublishedStrategies().slice(0, 2);
  const highValueSwag = demoSwagOffers.filter((offer) => offer.estimatedValue === "high");
  const longLines = demoLineReports.filter(
    (report) => report.crowdLevel === "long" || report.crowdLevel === "packed"
  );

  return (
    <AppShell title={event.name} subtitle={`${event.city} · ${event.venue}`}>
      <TrackView name="event_viewed" metadata={{ slug }} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={event.status === "live" ? "free" : "neutral"}>
            {event.status.toUpperCase()}
          </Badge>
          <span className="text-sm text-zinc-600">
            {formatEventDate(event.startsAt, event.timezone)}
          </span>
        </div>
        <p className="mt-3 text-sm text-zinc-700">{event.description}</p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/events/${slug}/strategies`}
          className="flex min-h-12 items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          Browse Strategies
        </Link>
        <Link
          href={`/events/${slug}/booths`}
          className="flex min-h-12 items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          Browse Booths
        </Link>
      </div>
      <WalletButton />

      {longLines.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Long-line warnings</h2>
          {longLines.map((report) => {
            const booth = demoBooths.find((item) => item.id === report.boothId);
            return (
              <Link
                key={report.id}
                href={`/events/${slug}/booths/${report.boothId}`}
                className="block rounded-2xl border border-rose-200 bg-rose-50 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{booth?.name ?? report.boothId}</h3>
                  <Badge tone="warning">{report.crowdLevel}</Badge>
                </div>
                <p className="mt-1 text-sm text-rose-800">
                  ~{report.estimatedWaitMinutes} min wait · {report.note}
                </p>
              </Link>
            );
          })}
        </section>
      ) : null}

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Featured strategies</h2>
          <Link href={`/events/${slug}/strategies`} className="text-sm font-medium text-cyan-700">
            See all
          </Link>
        </div>
        {featured.map((strategy) => (
          <Link
            key={strategy.id}
            href={`/events/${slug}/strategies/${strategy.id}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold break-words">{strategy.title}</h3>
              <Badge tone={strategy.visibility === "free" ? "free" : "paid"}>
                {strategy.visibility === "free"
                  ? "Free"
                  : `${strategy.priceAmount} ${strategy.priceAsset}`}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-700">{strategy.summary}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">High-value swag</h2>
        <ul className="space-y-2">
          {highValueSwag.map((offer) => {
            const booth = demoBooths.find((item) => item.id === offer.boothId);
            return (
              <li
                key={offer.id}
                className="rounded-2xl border border-zinc-200 bg-white p-3 text-sm shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{offer.itemName}</span>
                  <Badge tone="fresh">high value</Badge>
                </div>
                <p className="mt-1 text-zinc-600">{booth?.name}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </AppShell>
  );
}
