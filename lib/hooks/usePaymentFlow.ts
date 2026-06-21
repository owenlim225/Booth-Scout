"use client";

import { useCallback, useState } from "react";
import {
  type PaymentState,
  unlockAndVerify,
  UnlockVerificationError,
} from "@/lib/stellar/unlock-flow";

type StartPaymentInput = {
  strategyId: number;
  strategyKey: string;
  buyer: string;
};

const initialState: PaymentState = "idle";

export function usePaymentFlow() {
  const [state, setState] = useState<PaymentState>(initialState);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startPayment = useCallback(async (input: StartPaymentInput) => {
    setState("building");
    setError(null);
    setTxHash(null);

    try {
      const outcome = await unlockAndVerify({
        ...input,
        onState: setState,
      });
      setTxHash(outcome.hash);
      setState("success");
      return outcome;
    } catch (cause) {
      setState("error");
      setError(
        cause instanceof UnlockVerificationError
          ? cause.message
          : cause instanceof Error
            ? cause.message
            : "Payment failed. Please retry."
      );
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
    setTxHash(null);
  }, []);

  return { state, txHash, error, startPayment, reset };
}
