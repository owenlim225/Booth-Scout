import type { ReactNode } from "react";

type BadgeTone = "neutral" | "free" | "paid" | "verified" | "offline" | "fresh" | "warning";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-700",
  free: "bg-emerald-100 text-emerald-800",
  paid: "bg-amber-100 text-amber-900",
  verified: "bg-cyan-100 text-cyan-900",
  offline: "bg-indigo-100 text-indigo-900",
  fresh: "bg-violet-100 text-violet-900",
  warning: "bg-rose-100 text-rose-800",
};

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
