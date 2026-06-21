import { get, set, del, keys } from "idb-keyval";
import { getBoothById } from "@/lib/demo/booths";
import type { ChecklistRun, ChecklistRunBooth, Strategy } from "@/types/demo";

const runKey = (runId: string) => `checklist:run:${runId}`;
const activeRunKey = (eventSlug: string) => `checklist:active:${eventSlug}`;
const RUN_PREFIX = "checklist:run:";

export async function saveChecklistRun(run: ChecklistRun): Promise<void> {
  await set(runKey(run.runId), run);
}

export async function getChecklistRun(runId: string): Promise<ChecklistRun | undefined> {
  return get<ChecklistRun | undefined>(runKey(runId));
}

export async function setActiveRunId(eventSlug: string, runId: string): Promise<void> {
  await set(activeRunKey(eventSlug), runId);
}

export async function getActiveRunId(eventSlug: string): Promise<string | undefined> {
  return get<string | undefined>(activeRunKey(eventSlug));
}

export async function listChecklistRuns(): Promise<ChecklistRun[]> {
  const allKeys = await keys();
  const runKeys = allKeys.filter(
    (key): key is string => typeof key === "string" && key.startsWith(RUN_PREFIX)
  );
  const runs = await Promise.all(runKeys.map((key) => get<ChecklistRun | undefined>(key)));
  return runs
    .filter((run): run is ChecklistRun => Boolean(run))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export async function deleteChecklistRun(runId: string): Promise<void> {
  await del(runKey(runId));
}

export async function updateChecklistBooth(
  runId: string,
  boothId: string,
  patch: Partial<Pick<ChecklistRunBooth, "completed" | "skipped" | "note">>
): Promise<ChecklistRun | undefined> {
  const run = await getChecklistRun(runId);
  if (!run) {
    return undefined;
  }

  const booths = run.booths.map((booth) =>
    booth.id === boothId ? { ...booth, ...patch } : booth
  );
  const updated: ChecklistRun = {
    ...run,
    booths,
    syncStatus: "local_only",
  };
  await saveChecklistRun(updated);
  return updated;
}

export function buildRunFromStrategy(
  strategy: Strategy,
  runId: string,
  eventSlug: string
): ChecklistRun {
  return {
    runId,
    eventSlug,
    strategyId: strategy.id,
    strategyTitle: strategy.title,
    startedAt: new Date().toISOString(),
    syncStatus: "local_only",
    booths: strategy.steps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((step) => {
        const booth = getBoothById(step.boothId);
        const runBooth: ChecklistRunBooth = {
          id: step.boothId,
          order: step.order,
          name: booth?.name ?? step.boothId,
          category: booth?.category ?? "Booth",
          requirement: booth?.requirement ?? step.actionText,
          swag: step.expectedSwag || booth?.swag || "",
          fallbackNote: step.fallbackIfLineLong || booth?.fallbackNote || "",
          actionText: step.actionText,
          completed: false,
          skipped: false,
        };
        return runBooth;
      }),
  };
}
