import type { EventSummary } from "@/types/demo";

export const demoEvent: EventSummary = {
  slug: "eth-manila-demo-summit",
  name: "ETH Manila Demo Summit",
  city: "Manila",
  venue: "SMX Convention Center",
  startsAt: "2026-07-15T09:00:00+08:00",
  endsAt: "2026-07-15T18:00:00+08:00",
  timezone: "Asia/Manila",
  status: "live",
  description:
    "A one-day Web3 builder summit with 30+ sponsor booths, swag drops, and live workshops across the SMX main hall.",
  testnetNotice: "Demo mode · Stellar Testnet · prices are not real money",
};

export function getEventBySlug(slug: string): EventSummary | undefined {
  return slug === demoEvent.slug ? demoEvent : undefined;
}
