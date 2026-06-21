"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { addReport } from "@/lib/storage/community-store";
import type { ReportTarget } from "@/types/demo";

type ReportButtonProps = {
  targetType: ReportTarget;
  targetId: string;
  reporter: string | null;
};

export function ReportButton({ targetType, targetId, reporter }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!reporter) {
    return null;
  }

  const submit = async () => {
    setError(null);
    try {
      await addReport({ targetType, targetId, reporter, reason });
      await track("report_created", { targetType, targetId });
      setDone(true);
      setOpen(false);
      setReason("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit report.");
    }
  };

  if (done) {
    return <p className="text-xs text-zinc-500">Report submitted. Thank you.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-zinc-500 underline underline-offset-2"
      >
        Report
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <label className="block text-xs font-semibold text-zinc-700" htmlFor="report-reason">
        Why are you reporting this?
      </label>
      <textarea
        id="report-reason"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={2}
        maxLength={500}
        className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
        placeholder="Describe the issue (e.g. encourages rule-breaking)."
      />
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          className="min-h-11 flex-1 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
        >
          Submit report
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="min-h-11 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
