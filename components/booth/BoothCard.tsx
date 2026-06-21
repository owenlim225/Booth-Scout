import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { Booth } from "@/types/demo";

type BoothCardProps = {
  booth: Booth;
  eventSlug: string;
};

export function BoothCard({ booth, eventSlug }: BoothCardProps) {
  return (
    <Link
      href={`/events/${eventSlug}/booths/${booth.id}`}
      className="block min-h-12 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 active:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight break-words">{booth.name}</h2>
        <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
          #{booth.boothNumber}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-600 break-words">{booth.sponsorName}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{booth.category}</Badge>
        {booth.adminVerified ? <Badge tone="verified">Verified</Badge> : null}
      </div>
      <p className="mt-2 truncate text-xs text-zinc-500">
        <span className="font-medium text-zinc-600">Requires:</span> {booth.requirement}
      </p>
      <p className="mt-1 truncate text-xs text-emerald-700">
        <span className="font-medium">Swag:</span> {booth.swag}
      </p>
    </Link>
  );
}
