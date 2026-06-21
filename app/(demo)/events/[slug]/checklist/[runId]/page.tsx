"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { BoothStep } from "@/components/checklist/BoothStep";
import { Badge } from "@/components/ui/Badge";
import {
  getChecklistRun,
  saveChecklistRun,
  updateChecklistBooth,
} from "@/lib/storage/checklist-store";
import { track } from "@/lib/analytics";
import { demoEvent } from "@/lib/demo/events";
import type { ChecklistRun } from "@/types/demo";

const syncLabels: Record<ChecklistRun["syncStatus"], string> = {
  local_only: "Local only",
  synced: "Synced",
  conflict: "Conflict",
};

export default function ChecklistPage() {
  const params = useParams<{ slug: string; runId: string }>();
  const slug = params?.slug ?? demoEvent.slug;
  const runId = params?.runId;

  const [run, setRun] = useState<ChecklistRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const completedFiredRef = useRef<boolean>(false);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!runId) {
        return;
      }
      const stored = await getChecklistRun(runId);
      if (!stored) {
        setError("Checklist run not found in offline storage.");
        return;
      }
      setRun(stored);
    };
    void load();
  }, [runId]);

  const totals = useMemo(() => {
    const total = run?.booths.length ?? 0;
    const complete = run?.booths.filter((booth) => booth.completed).length ?? 0;
    return { total, complete };
  }, [run]);

  const allComplete = totals.total > 0 && totals.complete === totals.total;

  useEffect(() => {
    if (allComplete && runId && !completedFiredRef.current) {
      completedFiredRef.current = true;
      void track("checklist_completed", { runId });
    }
    if (!allComplete) {
      completedFiredRef.current = false;
    }
  }, [allComplete, runId]);

  const toggleComplete = useCallback(
    async (boothId: string) => {
      if (!runId) {
        return;
      }
      const booth = run?.booths.find((item) => item.id === boothId);
      const nextCompleted = !booth?.completed;
      const updated = await updateChecklistBooth(runId, boothId, {
        completed: nextCompleted,
        skipped: nextCompleted ? false : booth?.skipped ?? false,
      });
      if (updated) {
        setRun(updated);
        if (nextCompleted) {
          void track("checklist_step_completed", { runId, boothId });
        }
      }
    },
    [run, runId]
  );

  const toggleSkipped = useCallback(
    async (boothId: string) => {
      if (!runId) {
        return;
      }
      const booth = run?.booths.find((item) => item.id === boothId);
      const updated = await updateChecklistBooth(runId, boothId, {
        skipped: !booth?.skipped,
      });
      if (updated) {
        setRun(updated);
      }
    },
    [run, runId]
  );

  const saveNote = useCallback(
    async (boothId: string, note: string) => {
      if (!runId) {
        return;
      }
      const updated = await updateChecklistBooth(runId, boothId, { note });
      if (updated) {
        setRun(updated);
      }
    },
    [runId]
  );

  const handleSync = useCallback(async () => {
    if (!runId || !online) {
      return;
    }
    setSyncing(true);
    const stored = await getChecklistRun(runId);
    if (stored) {
      const synced: ChecklistRun = {
        ...stored,
        lastSyncedAt: new Date().toISOString(),
        syncStatus: "synced",
      };
      await saveChecklistRun(synced);
      setRun(synced);
    }
    setSyncing(false);
  }, [runId, online]);

  return (
    <AppShell
      title={run?.strategyTitle ?? "Checklist"}
      subtitle={run ? demoEvent.name : undefined}
      backHref={`/events/${slug}/checklist`}
    >
      {run ? (
        <Link
          href={`/events/${slug}/strategies/${run.strategyId}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          View strategy detail
        </Link>
      ) : null}

      <div className="sticky top-2 z-10 space-y-2 rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-md">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            {totals.complete}/{totals.total} complete
          </p>
          <div className="flex items-center gap-2">
            <Badge tone="offline">Offline saved</Badge>
            <Badge tone={run?.syncStatus === "synced" ? "verified" : "warning"}>
              {syncLabels[run?.syncStatus ?? "local_only"]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-zinc-300">
            {online ? "Online" : "Offline — changes saved locally"}
          </span>
          <button
            type="button"
            onClick={handleSync}
            disabled={!online || syncing || run?.syncStatus === "synced"}
            className="min-h-11 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {run?.syncStatus === "synced" ? "Synced" : syncing ? "Syncing…" : "Sync when online"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      {!run && !error ? (
        <p className="text-sm text-zinc-600">Loading offline checklist…</p>
      ) : null}

      {allComplete ? (
        <p className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900">
          🎉 All steps complete. Nice work!
        </p>
      ) : null}

      {run?.booths.map((booth) => (
        <BoothStep
          key={booth.id}
          booth={booth}
          onToggleComplete={toggleComplete}
          onToggleSkipped={toggleSkipped}
          onSaveNote={saveNote}
        />
      ))}
    </AppShell>
  );
}
