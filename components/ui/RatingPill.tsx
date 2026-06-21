import type { RatingLevel } from "@/types/demo";

type RatingPillProps = {
  label: string;
  level: RatingLevel;
  // For value: high is good (green). For hassle: high is bad (rose). Use `invert` for hassle.
  invert?: boolean;
};

function toneFor(level: RatingLevel, invert: boolean): string {
  const good = "bg-emerald-100 text-emerald-800";
  const mid = "bg-amber-100 text-amber-900";
  const bad = "bg-rose-100 text-rose-800";
  if (level === "medium") {
    return mid;
  }
  const isGood = invert ? level === "low" : level === "high";
  return isGood ? good : bad;
}

export function RatingPill({ label, level, invert = false }: RatingPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${toneFor(
        level,
        invert
      )}`}
    >
      {label}: {level}
    </span>
  );
}
