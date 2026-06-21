import { notFound } from "next/navigation";
import { TrackView } from "@/components/analytics/TrackView";
import { CommunitySection } from "@/components/community/CommunitySection";
import { AppShell } from "@/components/layout/AppShell";
import { StrategyExperience } from "@/components/strategy/StrategyExperience";
import { Badge } from "@/components/ui/Badge";
import { RatingPill } from "@/components/ui/RatingPill";
import { demoEvent } from "@/lib/demo/events";
import { getStrategyById } from "@/lib/demo/strategies";

type Params = Promise<{ slug: string; strategyId: string }>;

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

export default async function StrategyPage({ params }: { params: Params }) {
  const { slug, strategyId } = await params;
  const strategy = getStrategyById(strategyId);
  if (slug !== demoEvent.slug || !strategy || strategy.status !== "published") {
    notFound();
  }

  const isPaid = strategy.visibility === "paid";

  return (
    <AppShell
      title={strategy.title}
      subtitle={`by ${strategy.creatorName}`}
      backHref={`/events/${slug}/strategies`}
    >
      <TrackView name="strategy_preview_viewed" metadata={{ strategyId }} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isPaid ? "paid" : "free"}>
            {isPaid ? `${strategy.priceAmount} ${strategy.priceAsset}` : "Free"}
          </Badge>
          <span className="text-xs text-zinc-600">{strategy.estimatedMinutes} min</span>
          <span aria-hidden="true" className="text-xs text-zinc-400">
            ·
          </span>
          <span className="text-xs text-zinc-600">{strategy.steps.length} booth stops</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingPill label="Value" level={strategy.valueRating} />
          <RatingPill label="Hassle" level={strategy.hassleRating} invert />
        </div>

        <p className="mt-3 text-sm font-medium text-zinc-700">
          <span className="text-emerald-700">&#9650;{strategy.likesCount}</span>{" "}
          <span className="text-rose-700">&#9660;{strategy.dislikesCount}</span>
        </p>

        <p className="mt-2 text-xs text-zinc-500">Last updated {formatDate(strategy.updatedAt)}</p>

        <p className="mt-3 text-sm text-zinc-700 break-words">{strategy.summary}</p>
      </section>

      {isPaid && strategy.previewSteps.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-800">Preview stops</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
            {strategy.previewSteps.slice(0, 2).map((step, index) => (
              <li key={index} className="break-words">
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-zinc-500">
            Unlock to reveal the full ordered route.
          </p>
        </section>
      ) : null}

      <p className="text-xs text-zinc-500">Strategies should follow event and booth rules.</p>

      <StrategyExperience eventSlug={slug} strategy={strategy} />

      <CommunitySection
        targetType="strategy"
        targetId={strategy.id}
        likes={strategy.likesCount}
        dislikes={strategy.dislikesCount}
        reportType="strategy"
      />
    </AppShell>
  );
}
