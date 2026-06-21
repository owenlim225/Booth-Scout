"use client";

import { useCallback, useMemo, useState } from "react";
import { connectFreighter, ensureFreighterTestnet } from "@/lib/stellar/freighter";

type WalletState = "idle" | "connecting" | "connected" | "error";

export function useWallet() {
  const [state, setState] = useState<WalletState>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setState("connecting");
    setError(null);
    try {
      await ensureFreighterTestnet();
      const nextAddress = await connectFreighter();
      setAddress(nextAddress);
      setState("connected");
    } catch (cause) {
      setAddress(null);
      setState("error");
      setError(cause instanceof Error ? cause.message : "Unable to connect wallet");
    }
  }, []);

  const isConnected = useMemo(() => state === "connected" && Boolean(address), [address, state]);

  return { state, address, error, connect, isConnected };
}
