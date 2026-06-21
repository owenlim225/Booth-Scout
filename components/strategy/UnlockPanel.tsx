"use client";

import { useMemo } from "react";
import { track } from "@/lib/analytics";
import { usePaymentFlow } from "@/lib/hooks/usePaymentFlow";
import { useWallet } from "@/lib/hooks/useWallet";
import { stellarConfig } from "@/lib/stellar/config";
import type { PaymentState } from "@/lib/stellar/unlock-flow";
import type { PriceAsset } from "@/types/demo";

type UnlockPanelProps = {
  strategyKey: string;
  strategyId: number;
  priceUsdc: number;
  priceAsset?: PriceAsset;
  locked?: boolean;
  onUnlocked: (buyer: string) => Promise<void> | void;
};

const stateLabel: Record<PaymentState, string> = {
  idle: "Ready to unlock on Stellar Testnet",
  building: "Preparing transaction…",
  signing: "Confirm in Freighter…",
  submitting: "Submitting transaction…",
  confirming: "Confirming ledger status…",
  success: "Unlock verified.",
  error: "Unlock failed. Retry when ready.",
};

export function UnlockPanel({
  strategyKey,
  strategyId,
  priceUsdc,
  priceAsset = "USDC",
  locked = true,
  onUnlocked,
}: UnlockPanelProps) {
  const wallet = useWallet();
  const payment = usePaymentFlow();

  const ctaLabel = useMemo(() => {
    if (!wallet.isConnected) {
      return wallet.state === "connecting" ? "Opening Freighter…" : "Connect Freighter";
    }
    if (payment.state === "success") {
      return "Unlocked";
    }
    if (payment.state === "error") {
      return "Retry Payment";
    }
    if (payment.state !== "idle") {
      return stateLabel[payment.state];
    }
    return `Unlock · ${priceUsdc} ${priceAsset}`;
  }, [payment.state, priceUsdc, priceAsset, wallet.isConnected, wallet.state]);

  const busy = wallet.state === "connecting" || !["idle", "error"].includes(payment.state);

  const platformFee = (priceUsdc * 5) / 100;
  const strategistShare = priceUsdc - platformFee;

  const handlePress = async () => {
    if (!wallet.isConnected) {
      await track("freighter_connect_started", { strategyId: strategyKey });
      await wallet.connect();
      if (wallet.address) {
        await track("freighter_connected", { strategyId: strategyKey });
      }
      return;
    }
    if (!wallet.address) {
      return;
    }

    try {
      await track("unlock_started", { strategyId: strategyKey });
      await payment.startPayment({ strategyId, strategyKey, buyer: wallet.address });
      await track("transaction_confirmed", { strategyId: strategyKey });
      await onUnlocked(wallet.address);
    } catch {
      await track("transaction_failed", { strategyId: strategyKey });
    }
  };

  if (!locked) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Unlock with Freighter</h2>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
          {priceUsdc} {priceAsset}
        </span>
      </div>

      <dl className="mt-3 space-y-1 text-sm text-zinc-600">
        <div className="flex justify-between">
          <dt>Platform fee (5%)</dt>
          <dd>
            {platformFee.toFixed(2)} {priceAsset}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Strategist share</dt>
          <dd>
            {strategistShare.toFixed(2)} {priceAsset}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>Network</dt>
          <dd>Stellar Testnet</dd>
        </div>
        {stellarConfig.contractId ? (
          <div className="flex justify-between gap-2">
            <dt>Contract</dt>
            <dd className="truncate font-mono text-xs">{stellarConfig.contractId}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-3 text-sm text-zinc-600" aria-live="polite">
        {stateLabel[payment.state]}
      </p>
      {wallet.address ? (
        <p className="mt-2 rounded-lg bg-zinc-100 px-2 py-1 font-mono text-xs break-all">
          {wallet.address}
        </p>
      ) : null}
      {wallet.error ? <p className="mt-2 text-sm text-rose-700">{wallet.error}</p> : null}
      {payment.error ? <p className="mt-2 text-sm text-rose-700">{payment.error}</p> : null}
      {payment.txHash ? (
        <p className="mt-2 rounded-lg bg-emerald-100 px-2 py-1 font-mono text-xs break-all">
          tx: {payment.txHash}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handlePress}
        disabled={busy}
        className="mt-4 min-h-12 w-full rounded-xl bg-zinc-950 px-4 py-3 text-base font-semibold text-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
      >
        {ctaLabel}
      </button>
    </section>
  );
}
