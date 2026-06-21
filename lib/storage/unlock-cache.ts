import { get, set } from "idb-keyval";

type UnlockReceipt = {
  strategyId: string;
  buyer: string;
  txHash: string;
  verifiedAt: string;
};

const keyFor = (strategyId: string, buyer: string) =>
  `unlock:${strategyId}:${buyer.toUpperCase()}`;

export async function cacheUnlockReceipt(receipt: UnlockReceipt): Promise<void> {
  await set(keyFor(receipt.strategyId, receipt.buyer), receipt);
}

export async function getUnlockReceipt(
  strategyId: string,
  buyer: string
): Promise<UnlockReceipt | undefined> {
  return get<UnlockReceipt | undefined>(keyFor(strategyId, buyer));
}
