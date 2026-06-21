import type { LineReport } from "@/types/demo";

export const demoLineReports: LineReport[] = [
  {
    id: "line-stellar-1",
    boothId: "stellar-hub",
    reporter: "scout_anita",
    crowdLevel: "long",
    estimatedWaitMinutes: 18,
    note: "Quick-claim lane opens around 1 PM.",
    createdAt: "2026-07-15T09:40:00+08:00",
  },
  {
    id: "line-soroban-1",
    boothId: "soroban-lab",
    reporter: "dev_marco",
    crowdLevel: "medium",
    estimatedWaitMinutes: 8,
    note: "Quiz tablets reset every few minutes; keep your answers ready.",
    createdAt: "2026-07-15T09:55:00+08:00",
  },
  {
    id: "line-validator-1",
    boothId: "validator-lounge",
    reporter: "node_jen",
    crowdLevel: "short",
    estimatedWaitMinutes: 3,
    note: "Easiest high-value swag right now.",
    createdAt: "2026-07-15T10:10:00+08:00",
  },
];

export function getLineReportsForBooth(boothId: string): LineReport[] {
  return demoLineReports
    .filter((report) => report.boothId === boothId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
