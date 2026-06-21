"use client";

import { useMemo, useState } from "react";
import { StrategyCard } from "@/components/strategy/StrategyCard";
import type { RatingLevel, Strategy } from "@/types/demo";

type StrategyBrowseProps = {
  strategies: Strategy[];
  eventSlug: string;
};

type FilterKey = "free" | "paid" | "short" | "highValue" | "lowHassle" | "recentlyUpdated";

type SortKey = "trending" | "newest" | "mostLiked" | "lowestHassle";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "free", label: "Free" },
  { key: "paid", label: "Paid" },
  { key: "short", label: "Short route" },
  { key: "highValue", label: "High value" },
  { key: "lowHassle", label: "Low hassle" },
  { key: "recentlyUpdated", label: "Recently updated" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "newest", label: "Newest" },
  { key: "mostLiked", label: "Most liked" },
  { key: "lowestHassle", label: "Lowest hassle" },
];

const SHORT_ROUTE_MAX_MINUTES = 30;

const hassleRank: Record<RatingLevel, number> = { low: 0, medium: 1, high: 2 };

function matchesFilters(strategy: Strategy, active: Set<FilterKey>): boolean {
  if (active.has("free") && strategy.visibility !== "free") {
    return false;
  }
  if (active.has("paid") && strategy.visibility !== "paid") {
    return false;
  }
  if (active.has("short") && strategy.estimatedMinutes > SHORT_ROUTE_MAX_MINUTES) {
    return false;
  }
  if (active.has("highValue") && strategy.valueRating !== "high") {
    return false;
  }
  if (active.has("lowHassle") && strategy.hassleRating !== "low") {
    return false;
  }
  return true;
}

function compareBySort(a: Strategy, b: Strategy, sort: SortKey): number {
  switch (sort) {
    case "newest":
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    case "mostLiked":
      return b.likesCount - a.likesCount;
    case "lowestHassle":
      return hassleRank[a.hassleRating] - hassleRank[b.hassleRating];
    case "trending":
    default:
      return b.likesCount - b.dislikesCount - (a.likesCount - a.dislikesCount);
  }
}

export function StrategyBrowse({ strategies, eventSlug }: StrategyBrowseProps) {
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [sort, setSort] = useState<SortKey>("trending");

  function toggleFilter(key: FilterKey) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const visible = useMemo(() => {
    const filtered = strategies.filter((strategy) => matchesFilters(strategy, activeFilters));
    const recentHint = activeFilters.has("recentlyUpdated");
    return [...filtered].sort((a, b) => {
      if (recentHint) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return compareBySort(a, b, sort);
    });
  }, [strategies, activeFilters, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilters.has(filter.key);
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleFilter(filter.key)}
              className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                isActive
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-zinc-300 bg-white text-zinc-700"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="strategy-sort" className="text-xs font-medium text-zinc-600">
          Sort by
        </label>
        <select
          id="strategy-sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          disabled={activeFilters.has("recentlyUpdated")}
          className="min-h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium disabled:bg-zinc-100 disabled:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          {SORTS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        {activeFilters.has("recentlyUpdated") ? (
          <p className="text-xs text-zinc-500">Showing most recently updated first.</p>
        ) : null}
      </div>

      <p className="text-sm font-medium text-zinc-700" aria-live="polite">
        {visible.length} {visible.length === 1 ? "strategy" : "strategies"}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
          No strategies match these filters. Try removing one.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((strategy) => (
            <li key={strategy.id}>
              <StrategyCard strategy={strategy} eventSlug={eventSlug} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
