"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { WalletButton } from "@/components/layout/WalletButton";
import { listChecklistRuns } from "@/lib/storage/checklist-store";
import { demoEvent } from "@/lib/demo/events";
import type { ChecklistRun } from "@/types/demo";

export default function ProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? demoEvent.slug;

  const [runs, setRuns] = useState<ChecklistRun[] | null>(null);

  useEffect(() => {
    const load = async () => {
      const allRuns = await listChecklistRuns();
      setRuns(
        allRuns.filter((run) => run.eventSlug === slug || run.eventSlug === demoEvent.slug)
      );
    };
    void load();
  }, [slug]);

  return (
    <AppShell title="Profile" subtitle={demoEvent.name} backHref={`/events/${slug}`}>
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Wallet</h2>
        <div className="mt-3">
          <WalletButton />
        </div>
        <p className="mt-3 text-sm text-zinc-600 break-words">
          BoothScout never stores your private keys or seed phrase. Signing happens inside
          Freighter, and only your public address is shared with the app.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Your started checklists</h2>
          <Badge tone="offline">{runs?.length ?? 0}</Badge>
        </div>
        {runs === null ? (
          <p className="mt-2 text-sm text-zinc-600">Loading…</p>
        ) : runs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            No checklists yet. Start one from a strategy to track booths offline.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {runs.map((run) => {
              const complete = run.booths.filter((booth) => booth.completed).length;
              return (
                <li key={run.runId}>
                  <Link
                    href={`/events/${slug}/checklist/${run.runId}`}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <span className="font-medium break-words">{run.strategyTitle}</span>
                    <span className="shrink-0 text-zinc-500">
                      {complete}/{run.booths.length}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Quick links</h2>
        <div className="mt-3 space-y-2">
          <Link
            href={`/events/${slug}/create`}
            className="flex min-h-12 items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Create a strategy
          </Link>
          <Link
            href="/admin"
            className="flex min-h-12 items-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            Admin dashboard
          </Link>
        </div>
      </section>

      <p className="text-sm text-zinc-500 break-words">
        Unlock receipts are recorded on Stellar/Soroban, so your purchases stay verifiable
        on-chain.
      </p>
    </AppShell>
  );
}
