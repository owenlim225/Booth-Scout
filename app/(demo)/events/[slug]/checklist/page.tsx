"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import {
  deleteChecklistRun,
  getActiveRunId,
  listChecklistRuns,
} from "@/lib/storage/checklist-store";
import { demoEvent } from "@/lib/demo/events";
import type { ChecklistRun } from "@/types/demo";

function formatStarted(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChecklistListPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? demoEvent.slug;

  const [runs, setRuns] = useState<ChecklistRun[] | null>(null);
  const [activeRunId, setActiveRunIdState] = useState<string | undefined>(undefined);

  const refresh = useCallback(async () => {
    const [allRuns, active] = await Promise.all([
      listChecklistRuns(),
      getActiveRunId(slug),
    ]);
    setRuns(allRuns.filter((run) => run.eventSlug === slug || run.eventSlug === demoEvent.slug));
    setActiveRunIdState(active);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [allRuns, active] = await Promise.all([
        listChecklistRuns(),
        getActiveRunId(slug),
      ]);
      if (!cancelled) {
        setRuns(
          allRuns.filter(
            (run) => run.eventSlug === slug || run.eventSlug === demoEvent.slug
          )
        );
        setActiveRunIdState(active);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleDelete = useCallback(
    async (runId: string) => {
      await deleteChecklistRun(runId);
      await refresh();
    },
    [refresh]
  );

  return (
    <AppShell title="Checklist" subtitle={demoEvent.name} backHref={`/events/${slug}`}>
      {runs === null ? (
        <p className="text-sm text-zinc-600">Loading offline checklists…</p>
      ) : runs.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm">
          <p className="text-sm font-medium text-zinc-700">No offline checklist saved yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Start one from a strategy to walk booths offline at the event.
          </p>
          <Link
            href={`/events/${slug}/strategies`}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            Browse Strategies
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {runs.map((run) => {
            const complete = run.booths.filter((booth) => booth.completed).length;
            const isActive = run.runId === activeRunId;
            return (
              <li
                key={run.runId}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <Link
                  href={`/events/${slug}/checklist/${run.runId}`}
                  className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold break-words">{run.strategyTitle}</h3>
                    {isActive ? <Badge tone="fresh">Active</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    Started {formatStarted(run.startedAt)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-700">
                    {complete}/{run.booths.length} complete
                  </p>
                  <div className="mt-2">
                    <Badge tone="offline">Offline saved</Badge>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(run.runId)}
                  aria-label={`Delete checklist for ${run.strategyTitle}`}
                  className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
