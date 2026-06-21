"use client";

import { useState } from "react";
import { useWallet } from "@/lib/hooks/useWallet";
import type { CrowdLevel } from "@/types/demo";

type LineReportInput = {
  crowdLevel: CrowdLevel;
  estimatedWaitMinutes: number;
  note: string;
  reporter: string;
};

type LineReportFormProps = {
  onSubmit: (report: LineReportInput) => void;
};

const CROWD_LEVELS: CrowdLevel[] = ["empty", "short", "medium", "long", "packed"];
const MAX_WAIT = 120;
const MAX_NOTE = 200;

export function LineReportForm({ onSubmit }: LineReportFormProps) {
  const wallet = useWallet();
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>("short");
  const [waitMinutes, setWaitMinutes] = useState<number>(5);
  const [note, setNote] = useState<string>("");

  if (!wallet.isConnected || !wallet.address) {
    return (
      <button
        type="button"
        onClick={() => void wallet.connect()}
        className="min-h-11 w-full rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
      >
        Connect Freighter to submit a line report
      </button>
    );
  }

  const address = wallet.address;

  function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const safeWait = Math.min(Math.max(0, Math.round(waitMinutes || 0)), MAX_WAIT);
    onSubmit({
      crowdLevel,
      estimatedWaitMinutes: safeWait,
      note: note.trim(),
      reporter: address,
    });
    setCrowdLevel("short");
    setWaitMinutes(5);
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Crowd level
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {CROWD_LEVELS.map((level) => {
            const active = level === crowdLevel;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => setCrowdLevel(level)}
                className={`min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  active
                    ? "border-cyan-500 bg-cyan-50 text-cyan-900"
                    : "border-zinc-300 bg-white text-zinc-600"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="line-report-wait"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Estimated wait (minutes)
        </label>
        <input
          id="line-report-wait"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_WAIT}
          value={waitMinutes}
          onChange={(changeEvent) => setWaitMinutes(Number(changeEvent.target.value))}
          className="mt-2 min-h-11 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        />
      </div>

      <div>
        <label
          htmlFor="line-report-note"
          className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
        >
          Note (optional)
        </label>
        <textarea
          id="line-report-note"
          value={note}
          maxLength={MAX_NOTE}
          rows={2}
          onChange={(changeEvent) => setNote(changeEvent.target.value)}
          placeholder="e.g. Quick-claim lane just opened"
          className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        />
        <p className="mt-1 text-right text-[11px] text-zinc-400">
          {note.length}/{MAX_NOTE}
        </p>
      </div>

      <button
        type="submit"
        className="min-h-12 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:bg-emerald-700"
      >
        Submit line report
      </button>
    </form>
  );
}
