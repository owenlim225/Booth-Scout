# BoothScout

Soroban contract for BoothScout premium strategy unlock receipts and payout split.

## Problem and Solution

Crowded conference attendees lose time chasing swag blindly. BoothScout sells a short premium route and records unlock receipts on Stellar so access checks and strategist earnings are transparent.

## Timeline

- **MVP:** One event, one strategy, one unlock flow
- **Next:** Multi-strategy marketplace + richer analytics

## Stellar Features Used

- Soroban smart contracts
- Freighter signing flow
- Testnet USDC/XLM transfer rails

## Vision

Turn local conference booth intelligence into a lightweight creator economy backed by low-fee Stellar payments.

## Prerequisites

- Rust toolchain
- `wasm32-unknown-unknown` target
- Stellar CLI
- Freighter wallet
- Stellar Testnet accounts

## Build

```bash
stellar contract build
```

## Test

```bash
cargo test
```

## Deploy (Testnet)

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/booth_scout.wasm \
  --source deployer \
  --network testnet
```

## Sample Unlock Invocation

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source buyer \
  --network testnet \
  -- unlock_strategy \
  --strategy_id 1 \
  --buyer <BUYER_ADDRESS>
```

## License

MIT
