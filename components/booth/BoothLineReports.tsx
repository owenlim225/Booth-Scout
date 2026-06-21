"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { LineReportForm } from "@/components/booth/LineReportForm";
import { getLineReportsForBooth } from "@/lib/demo/line-reports";
import type { CrowdLevel, LineReport } from "@/types/demo";

type BoothLineReportsProps = {
  boothId: string;
};

function crowdTone(level: CrowdLevel): "free" | "paid" | "warning" {
  if (level === "long" || level === "packed") {
    return "warning";
  }
  if (level === "medium") {
    return "paid";
  }
  return "free";
}

function shortReporter(reporter: string): string {
  if (reporter.length <= 12) {
    return reporter;
  }
  return `${reporter.slice(0, 6)}…${reporter.slice(-4)}`;
}

function formatTime(createdAt: string): string {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }
  return parsed.toLocaleString();
}

export function BoothLineReports({ boothId }: BoothLineReportsProps) {
  const [reports, setReports] = useState<LineReport[]>(() => getLineReportsForBooth(boothId));

  function handleSubmit(input: {
    crowdLevel: CrowdLevel;
    estimatedWaitMinutes: number;
    note: string;
    reporter: string;
  }) {
    const newReport: LineReport = {
      id: crypto.randomUUID(),
      boothId,
      reporter: input.reporter,
      crowdLevel: input.crowdLevel,
      estimatedWaitMinutes: input.estimatedWaitMinutes,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    setReports((current) => [newReport, ...current]);
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-800">Crowd &amp; line reports</h2>

      {reports.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
          No line reports yet. Be the first to share how busy this booth is.
        </p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={crowdTone(report.crowdLevel)}>
                  <span className="capitalize">{report.crowdLevel}</span>
                </Badge>
                <span className="text-sm font-semibold text-zinc-700">
                  ~{report.estimatedWaitMinutes} min wait
                </span>
              </div>
              {report.note ? (
                <p className="mt-2 text-sm text-zinc-700 break-words">{report.note}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-xs text-zinc-400">
                <span className="font-mono">{shortReporter(report.reporter)}</span>
                <span>{formatTime(report.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <LineReportForm onSubmit={handleSubmit} />
    </section>
  );
}
