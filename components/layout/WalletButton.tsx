"use client";

import { track } from "@/lib/analytics";
import { useWallet } from "@/lib/hooks/useWallet";

function shorten(address: string): string {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function WalletButton() {
  const wallet = useWallet();

  const handlePress = async () => {
    if (wallet.isConnected) {
      return;
    }
    await track("freighter_connect_started", {});
    await wallet.connect();
    if (wallet.address) {
      await track("freighter_connected", {});
    }
  };

  if (wallet.isConnected && wallet.address) {
    return (
      <span className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        Connected · {shorten(wallet.address)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      disabled={wallet.state === "connecting"}
      className="min-h-12 w-full rounded-xl border border-zinc-300 px-4 py-3 text-base font-semibold disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
    >
      {wallet.state === "connecting" ? "Opening Freighter…" : "Connect Freighter"}
      {wallet.error ? (
        <span className="mt-1 block text-xs font-normal text-rose-700">{wallet.error}</span>
      ) : null}
    </button>
  );
}
