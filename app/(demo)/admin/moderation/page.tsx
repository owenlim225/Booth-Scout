"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { demoEvent } from "@/lib/demo/events";
import { listReports, updateReportStatus } from "@/lib/storage/community-store";
import type { Report } from "@/types/demo";

function statusTone(status: Report["status"]) {
  switch (status) {
    case "open":
      return "warning" as const;
    case "actioned":
      return "verified" as const;
    case "reviewed":
      return "fresh" as const;
    default:
      return "neutral" as const;
  }
}

function shortReporter(reporter: string): string {
  if (reporter.length <= 12) {
    return reporter;
  }
  return `${reporter.slice(0, 6)}…${reporter.slice(-4)}`;
}

const actionButtonClass =
  "min-h-12 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const stored = await listReports();
    setReports(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const stored = await listReports();
      if (!cancelled) {
        setReports(stored);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyStatus = async (reportId: string, status: Report["status"]) => {
    setBusyId(reportId);
    try {
      await updateReportStatus(reportId, status);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell
      title="Moderation"
      subtitle="Admin · reports queue"
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      {loading ? <p className="text-sm text-zinc-600">Loading reports…</p> : null}
      {!loading && reports.length === 0 ? (
        <p className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700">No reports.</p>
      ) : null}
      <ul className="space-y-2">
        {reports.map((report) => (
          <li key={report.id} className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold break-words">
                {report.targetType}: {report.targetId}
              </span>
              <Badge tone={statusTone(report.status)}>{report.status}</Badge>
            </div>
            <p className="text-sm text-zinc-700 break-words">{report.reason}</p>
            <p className="font-mono text-xs text-zinc-500 break-words">
              {shortReporter(report.reporter)} · {report.createdAt}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busyId === report.id}
                onClick={() => applyStatus(report.id, "reviewed")}
                className={`${actionButtonClass} border-zinc-300 text-zinc-800 disabled:opacity-40`}
              >
                Mark reviewed
              </button>
              <button
                type="button"
                disabled={busyId === report.id}
                onClick={() => applyStatus(report.id, "actioned")}
                className={`${actionButtonClass} border-cyan-400 text-cyan-900 disabled:opacity-40`}
              >
                Action
              </button>
              <button
                type="button"
                disabled={busyId === report.id}
                onClick={() => applyStatus(report.id, "dismissed")}
                className={`${actionButtonClass} border-zinc-300 text-zinc-600 disabled:opacity-40`}
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
