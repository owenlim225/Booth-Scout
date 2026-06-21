const DEFAULT_RPC = "https://soroban-testnet.stellar.org";
const DEFAULT_NETWORK = "Test SDF Network ; September 2015";

export const stellarConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC ?? DEFAULT_RPC,
  networkPassphrase:
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? DEFAULT_NETWORK,
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID ?? "",
  usdcContract: process.env.NEXT_PUBLIC_USDC_CONTRACT ?? "",
  demoStrategyId: process.env.NEXT_PUBLIC_DEMO_STRATEGY_ID ?? "1",
};

export const platformFeeBps = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 500);

export function hasContractConfig(): boolean {
  return Boolean(stellarConfig.contractId);
}
