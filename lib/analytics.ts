import { get, set } from "idb-keyval";
import type { AnalyticsEvent } from "@/types/demo";

const ANALYTICS_KEY = "analytics:events";
const MAX_EVENTS = 500;

export type AnalyticsEventName =
  | "event_viewed"
  | "booth_viewed"
  | "strategy_preview_viewed"
  | "freighter_connect_started"
  | "freighter_connected"
  | "unlock_started"
  | "transaction_signed"
  | "transaction_confirmed"
  | "transaction_failed"
  | "strategy_unlocked"
  | "strategy_started"
  | "checklist_step_completed"
  | "checklist_completed"
  | "strategy_created"
  | "strategy_published"
  | "comment_created"
  | "reaction_created"
  | "report_created";

export async function track(
  name: AnalyticsEventName,
  metadata: Record<string, string | number | boolean | null> = {}
): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const event: AnalyticsEvent = {
      id: `evt-${crypto.randomUUID?.() ?? Date.now().toString(36)}`,
      name,
      metadata,
      createdAt: new Date().toISOString(),
    };
    const stored = (await get<AnalyticsEvent[]>(ANALYTICS_KEY)) ?? [];
    const next = [event, ...stored].slice(0, MAX_EVENTS);
    await set(ANALYTICS_KEY, next);
  } catch {
    // Analytics is best-effort; never block UX on logging failures.
  }
}

export async function listAnalyticsEvents(): Promise<AnalyticsEvent[]> {
  if (typeof window === "undefined") {
    return [];
  }
  return (await get<AnalyticsEvent[]>(ANALYTICS_KEY)) ?? [];
}
