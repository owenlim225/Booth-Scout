import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { RatingPill } from "@/components/ui/RatingPill";
import type { Strategy } from "@/types/demo";

type StrategyCardProps = {
  strategy: Strategy;
  eventSlug: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return iso;
  }
  return dateFormatter.format(parsed);
}

export function StrategyCard({ strategy, eventSlug }: StrategyCardProps) {
  const isPaid = strategy.visibility === "paid";

  return (
    <Link
      href={`/events/${eventSlug}/strategies/${strategy.id}`}
      className="block min-h-11 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight break-words">
          {strategy.title}
        </h2>
        <Badge tone={isPaid ? "paid" : "free"}>
          {isPaid ? `${strategy.priceAmount} ${strategy.priceAsset}` : "Free"}
        </Badge>
      </div>

      <p className="mt-1 text-sm text-zinc-600 break-words">by {strategy.creatorName}</p>

      <p className="mt-2 text-sm text-zinc-700 break-words line-clamp-2">{strategy.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RatingPill label="Value" level={strategy.valueRating} />
        <RatingPill label="Hassle" level={strategy.hassleRating} invert />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
        <span>{strategy.steps.length} booth stops</span>
        <span aria-hidden="true">·</span>
        <span>{strategy.estimatedMinutes} min</span>
        <span aria-hidden="true">·</span>
        <span className="font-medium text-zinc-700">
          <span className="text-emerald-700">&#9650;{strategy.likesCount}</span>{" "}
          <span className="text-rose-700">&#9660;{strategy.dislikesCount}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span>Updated {formatDate(strategy.updatedAt)}</span>
      </div>
    </Link>
  );
}
