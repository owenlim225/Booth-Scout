import { stellarConfig } from "@/lib/stellar/config";

const STELLAR_ACCOUNT_REGEX = /^G[A-Z2-7]{55}$/;

export function validateStellarAddress(input: string | null): string {
  if (!input || !STELLAR_ACCOUNT_REGEX.test(input)) {
    throw new Error("Invalid Stellar account address.");
  }
  return input;
}

export async function simulateHasUnlock(
  strategyId: number,
  buyer: string
): Promise<boolean> {
  if (!stellarConfig.contractId) {
    return false;
  }

  try {
    const response = await fetch(`${stellarConfig.rpcUrl}/simulateTransaction`, {
      method: "POST",
      signal: AbortSignal.timeout(8_000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "boothscout-has-unlock",
        method: "simulateTransaction",
        params: {
          contractId: stellarConfig.contractId,
          function: "has_unlock",
          args: [strategyId, buyer],
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as {
      result?: { retval?: string | boolean };
    };
    return payload.result?.retval === true || payload.result?.retval === "true";
  } catch {
    return false;
  }
}
