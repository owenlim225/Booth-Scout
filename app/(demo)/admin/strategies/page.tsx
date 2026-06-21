"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AdminNav } from "@/components/admin/AdminNav";
import { Badge } from "@/components/ui/Badge";
import { demoEvent } from "@/lib/demo/events";
import { demoStrategies } from "@/lib/demo/strategies";
import { listLocalStrategies } from "@/lib/storage/community-store";
import type { Strategy } from "@/types/demo";

function statusTone(status: Strategy["status"]) {
  switch (status) {
    case "published":
      return "fresh" as const;
    case "hidden":
      return "warning" as const;
    case "removed":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export default function AdminStrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>(demoStrategies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const local = await listLocalStrategies();
      const seenIds = new Set(local.map((item) => item.id));
      const merged = [...local, ...demoStrategies.filter((item) => !seenIds.has(item.id))];
      setStrategies(merged);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <AppShell
      title="Strategies"
      subtitle="Admin · all strategies"
      backHref={`/events/${demoEvent.slug}`}
    >
      <AdminNav />
      {loading ? <p className="text-sm text-zinc-600">Loading strategies…</p> : null}
      <ul className="space-y-2">
        {strategies.map((strategy) => (
          <li key={strategy.id} className="space-y-2 rounded-xl border border-zinc-200 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-semibold break-words">{strategy.title}</span>
              {strategy.id.startsWith("local-") ? <Badge tone="offline">Local</Badge> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={strategy.visibility === "paid" ? "paid" : "free"}>
                {strategy.visibility === "paid"
                  ? `${strategy.priceAmount} ${strategy.priceAsset}`
                  : "Free"}
              </Badge>
              <Badge tone={statusTone(strategy.status)}>{strategy.status}</Badge>
            </div>
            <p className="text-xs text-zinc-500 break-words">by {strategy.creatorName}</p>
          </li>
        ))}
      </ul>
      {!loading && strategies.length === 0 ? (
        <p className="text-sm text-zinc-600">No strategies yet.</p>
      ) : null}
    </AppShell>
  );
}
