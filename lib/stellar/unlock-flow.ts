import { cacheUnlockReceipt } from "@/lib/storage/unlock-cache";
import { hasContractConfig } from "@/lib/stellar/config";
import { simulateHasUnlock } from "@/lib/stellar/contract-client";
import {
  ensureFreighterTestnet,
  freighterSignTransaction,
} from "@/lib/stellar/freighter";

export type PaymentState =
  | "idle"
  | "building"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export class UnlockVerificationError extends Error {
  constructor() {
    super("Unlock transaction completed but entitlement verification failed.");
    this.name = "UnlockVerificationError";
  }
}

type UnlockAndVerifyInput = {
  strategyId: number;
  strategyKey: string;
  buyer: string;
  onState: (state: PaymentState) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildDemoUnlockXdr(strategyId: number, buyer: string): string {
  return `BOOTHSCOUT_DEMO_UNLOCK::${strategyId.toString()}::${buyer}`;
}

function createDemoHash(seed: string): string {
  const bytes = new TextEncoder().encode(seed + Date.now().toString());
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}

export async function unlockAndVerify({
  strategyId,
  strategyKey,
  buyer,
  onState,
}: UnlockAndVerifyInput): Promise<{ hash: string }> {
  await ensureFreighterTestnet();

  onState("building");
  const unlockXdr = buildDemoUnlockXdr(strategyId, buyer);

  onState("signing");
  const signedXdr = await freighterSignTransaction(unlockXdr);

  onState("submitting");
  await sleep(900);
  const hash = createDemoHash(signedXdr);

  onState("confirming");
  await sleep(1200);

  const unlocked = hasContractConfig()
    ? await simulateHasUnlock(strategyId, buyer)
    : true;
  if (!unlocked) {
    throw new UnlockVerificationError();
  }

  await cacheUnlockReceipt({
    strategyId: strategyKey,
    buyer,
    txHash: hash,
    verifiedAt: new Date().toISOString(),
  });

  onState("success");
  return { hash };
}
