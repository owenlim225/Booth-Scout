"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UnlockPanel } from "@/components/strategy/UnlockPanel";
import { track } from "@/lib/analytics";
import {
  buildRunFromStrategy,
  saveChecklistRun,
  setActiveRunId,
} from "@/lib/storage/checklist-store";
import { getBoothById } from "@/lib/demo/booths";
import type { Strategy, StrategyStep } from "@/types/demo";

type StrategyExperienceProps = {
  eventSlug: string;
  strategy: Strategy;
};

type PremiumContent = {
  fullText: string;
  steps: StrategyStep[];
};

function StepList({ steps }: { steps: StrategyStep[] }) {
  return (
    <ol className="mt-3 space-y-2">
      {steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((step) => {
          const booth = getBoothById(step.boothId);
          return (
            <li
              key={step.order}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <p className="font-semibold">
                {step.order}. {booth?.name ?? step.boothId}
                {booth?.boothNumber ? (
                  <span className="ml-1 font-normal text-zinc-500">#{booth.boothNumber}</span>
                ) : null}
              </p>
              <p className="mt-1 text-zinc-700">{step.actionText}</p>
              <p className="mt-1 text-zinc-500">Expected swag: {step.expectedSwag}</p>
            </li>
          );
        })}
    </ol>
  );
}

export function StrategyExperience({ eventSlug, strategy }: StrategyExperienceProps) {
  const isFree = strategy.visibility === "free";
  const [premium, setPremium] = useState<PremiumContent | null>(
    isFree ? { fullText: strategy.fullText, steps: strategy.steps } : null
  );
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const router = useRouter();

  const isUnlocked = Boolean(premium);

  const fetchPremium = async (buyer: string) => {
    setLoadingPremium(true);
    setPremiumError(null);
    try {
      const response = await fetch(
        `/api/strategies/${strategy.id}/premium?buyer=${encodeURIComponent(buyer)}`
      );
      if (!response.ok) {
        throw new Error("Premium unlock verification failed.");
      }
      const payload = (await response.json()) as { premium: PremiumContent };
      setPremium(payload.premium);
      await track("strategy_unlocked", { strategyId: strategy.id });
    } catch (cause) {
      setPremiumError(cause instanceof Error ? cause.message : "Unable to load premium data.");
    } finally {
      setLoadingPremium(false);
    }
  };

  const startChecklist = async () => {
    setStarting(true);
    try {
      const runId = crypto.randomUUID();
      const run = buildRunFromStrategy(strategy, runId, eventSlug);
      await saveChecklistRun(run);
      await setActiveRunId(eventSlug, runId);
      await track("strategy_started", { strategyId: strategy.id });
      router.push(`/events/${eventSlug}/checklist/${runId}`);
    } catch {
      setPremiumError("Unable to save checklist locally. Please retry.");
      setStarting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isFree && strategy.contractStrategyId ? (
        <UnlockPanel
          strategyKey={strategy.id}
          strategyId={strategy.contractStrategyId}
          priceUsdc={strategy.priceAmount}
          priceAsset={strategy.priceAsset}
          locked={!isUnlocked}
          onUnlocked={fetchPremium}
        />
      ) : null}

      {loadingPremium ? (
        <p className="rounded-xl bg-zinc-100 px-3 py-2 text-sm">Loading premium route…</p>
      ) : null}
      {premiumError ? (
        <p className="rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-800">{premiumError}</p>
      ) : null}

      {premium ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="text-lg font-semibold">
            {isFree ? "Full Route" : "Unlocked Full Route"}
          </h2>
          <p className="mt-2 text-sm text-zinc-700">{premium.fullText}</p>
          <StepList steps={premium.steps} />
          <button
            type="button"
            onClick={startChecklist}
            disabled={starting}
            className="mt-4 min-h-12 w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {starting ? "Saving offline…" : "Start Route"}
          </button>
        </section>
      ) : null}
    </div>
  );
}
