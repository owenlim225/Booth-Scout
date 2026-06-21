"use client";

import { useState } from "react";
import type { ChecklistRunBooth } from "@/types/demo";

type BoothStepProps = {
  booth: ChecklistRunBooth;
  onToggleComplete: (boothId: string) => void;
  onToggleSkipped: (boothId: string) => void;
  onSaveNote?: (boothId: string, note: string) => void;
};

export function BoothStep({ booth, onToggleComplete, onToggleSkipped, onSaveNote }: BoothStepProps) {
  const [noteOpen, setNoteOpen] = useState<boolean>(Boolean(booth.note));
  const [draft, setDraft] = useState<string>(booth.note ?? "");

  const handleSaveNote = () => {
    onSaveNote?.(booth.id, draft.trim());
  };

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        booth.completed ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold break-words">
          {booth.order}. {booth.name}
        </h3>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-xs font-medium">
          {booth.category}
        </span>
      </div>

      {booth.actionText ? (
        <p className="mt-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-900 break-words">
          <span className="mr-1" aria-hidden="true">
            →
          </span>
          {booth.actionText}
        </p>
      ) : null}

      <p className="mt-2 text-sm text-zinc-700 break-words">
        <strong>Requirement:</strong> {booth.requirement}
      </p>
      <p className="mt-1 text-sm text-zinc-700 break-words">
        <strong>Swag:</strong> {booth.swag}
      </p>
      {booth.fallbackNote ? (
        <p className="mt-1 text-sm text-zinc-500 break-words">{booth.fallbackNote}</p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onToggleComplete(booth.id)}
          aria-label={`Mark ${booth.name} as complete`}
          aria-pressed={booth.completed}
          className="min-h-12 flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        >
          {booth.completed ? "Completed" : "Mark Complete"}
        </button>
        <button
          type="button"
          onClick={() => onToggleSkipped(booth.id)}
          aria-label={`Mark ${booth.name} as skipped`}
          aria-pressed={booth.skipped}
          className="min-h-12 flex-1 rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {booth.skipped ? "Skipped" : "Skip"}
        </button>
      </div>

      {onSaveNote ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setNoteOpen((open) => !open)}
            aria-expanded={noteOpen}
            className="inline-flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {noteOpen ? "Hide note" : booth.note ? "Edit note" : "Add note"}
          </button>
          {noteOpen ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={handleSaveNote}
                rows={3}
                placeholder="Quick note (wait time, contact, swag left…)"
                aria-label={`Quick note for ${booth.name}`}
                className="w-full resize-none rounded-xl border border-zinc-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              />
              <button
                type="button"
                onClick={handleSaveNote}
                className="min-h-11 w-full rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Save note
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
