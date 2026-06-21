type StrategyPreviewProps = {
  teaser: string;
  previewStops: string[];
};

export function StrategyPreview({ teaser, previewStops }: StrategyPreviewProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-zinc-700">{teaser}</p>
      <h2 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Free Preview Stops
      </h2>
      <ul className="mt-2 space-y-2">
        {previewStops.map((stop) => (
          <li key={stop} className="rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium">
            {stop}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3">
        <p className="text-sm text-zinc-600" aria-live="polite">
          Premium content locked. Complete on-chain unlock to reveal full ordered checklist.
        </p>
      </div>
    </section>
  );
}
