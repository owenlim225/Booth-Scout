import type { ReactNode } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

type AppShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  showDemoBanner?: boolean;
  children: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  backHref,
  showDemoBanner = true,
  children,
}: AppShellProps) {
  return (
    <>
      <main className="mx-auto safe-bottom flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-4">
        <header className="space-y-2">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <span aria-hidden="true">&larr;</span> Back
            </Link>
          ) : null}
          <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
          {subtitle ? <p className="text-sm text-zinc-600 break-words">{subtitle}</p> : null}
          {showDemoBanner ? <DemoBanner /> : null}
          <OfflineBanner />
        </header>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </main>
      <BottomNav />
    </>
  );
}
