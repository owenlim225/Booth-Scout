import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

const TESTNET_PHRASE = "Test SDF Network ; September 2015";

export class FreighterNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FreighterNetworkError";
  }
}

export async function connectFreighter(): Promise<string> {
  const connected = await isConnected();
  if (!connected.isConnected) {
    await requestAccess();
  }
  const address = await getAddress();
  if (address.error || !address.address) {
    throw new Error(address.error ?? "Unable to read Freighter address");
  }
  return address.address;
}

export async function ensureFreighterTestnet(): Promise<void> {
  const details = await getNetworkDetails();
  if (details.error) {
    throw new FreighterNetworkError(details.error);
  }
  if (details.network !== TESTNET_PHRASE) {
    throw new FreighterNetworkError("Switch Freighter to Stellar Testnet.");
  }
}

export async function freighterSignTransaction(xdr: string): Promise<string> {
  const signed = await signTransaction(xdr, {
    networkPassphrase: TESTNET_PHRASE,
  });
  if (signed.error || !signed.signedTxXdr) {
    throw new Error(signed.error ?? "Failed to sign transaction");
  }
  return signed.signedTxXdr;
}
