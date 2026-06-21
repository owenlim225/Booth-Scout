# BoothScout Bootcamp Prompt Template - Filled

## PROJECT NAME

BoothScout

## PROBLEM

A Web3 conference attendee at a crowded crypto event in Manila wastes 30-60 minutes walking between sponsor booths, waiting in long lines, and completing low-value swag requirements because booth rewards, requirements, and crowd conditions are scattered across word of mouth, Telegram chats, and sponsor pages.

## SOLUTION

BoothScout lets the attendee browse booth intelligence for free, unlock a premium booth-route strategy with a Freighter wallet payment, and start an offline-ready checklist; the unlock is recorded through a Soroban smart contract so strategy access and creator earnings are transparent, fast, and low-cost on Stellar.

## STELLAR FEATURES USED

Selected features:
- XLM / USDC transfers.
- Freighter wallet connection and transaction signing.
- Soroban smart contract for premium strategy unlock receipts.
- Stellar Testnet for bootcamp demo.
- Stellar Mainnet-ready payment configuration.

Not used in MVP:
- Built-in DEX.
- Custom event token.
- NFTs.
- Clawback/compliance.
- Complex marketplace payout automation.

## TARGET USERS

Primary users:
- Crypto/Web3 event attendees who already use wallets or are comfortable installing Freighter.
- Location: Web3 conferences, hackathons, summits, and side events in Southeast Asia, starting with Manila.
- Behavior: they move quickly between booths, care about high-value swag, and want to avoid wasting time on long lines or low-reward requirements.

Secondary users:
- Event attendees who create useful booth strategies after scouting the floor.
- They care because paid strategies let them earn USDC or XLM from practical event knowledge.

Admin user:
- BoothScout platform admin who creates the event page, adds official sponsor/booth listings, and moderates bad strategies or comments.

## CORE FEATURE MVP

One demo-able transaction flow:

Attendee action -> On-chain action -> Result

1. Attendee opens BoothScout and views a Web3 event page with sponsor booths and free strategy previews.
2. Attendee chooses a paid strategy called "High-Value Swag Route: Morning Sprint."
3. Attendee connects Freighter wallet on Stellar Testnet.
4. Attendee pays 2 USDC, or demo-priced XLM if USDC setup is unavailable.
5. Freighter signs a Soroban contract transaction calling `unlock_strategy`.
6. The Soroban contract verifies the payment amount, strategy id, buyer address, strategist address, and duplicate-unlock status.
7. The contract records the unlock and emits an unlock event.
8. BoothScout reads the confirmed unlock and reveals the full text, images, and ordered booth checklist.
9. Attendee presses Start.
10. The route is saved as an offline checklist with booth order, requirements, expected swag, and fallback notes.

Demo target: under 2 minutes.

## WHY THIS WINS

BoothScout fits Stellar hackathon criteria because it uses Stellar for real financial coordination: an attendee pays a small amount to unlock time-sensitive event intelligence, while a strategist can earn from useful local knowledge.

Judges should find it compelling because the MVP is narrow, demo-able, and practical: one attendee connects Freighter, pays on Stellar Testnet, unlocks creator content through Soroban, and uses an offline checklist during a real Web3 event.

## OPTIONAL EDGE

Offline / low-connectivity support:

After a user presses Start, BoothScout caches the premium strategy checklist locally so the attendee can keep following the booth route even inside a crowded venue with weak mobile data. Progress syncs later when the user reconnects.

## CONSTRAINTS

### REGION

- [x] SEA
- [ ] Africa
- [ ] LATAM
- [ ] South Asia
- [ ] MENA
- [ ] Global

### USER TYPE

- [ ] Unbanked
- [ ] Freelancers
- [x] Students
- [ ] SMEs
- [x] Creators
- [ ] Farmers
- [ ] NGOs
- [ ] Migrants

Additional precise user type:
- Web3 event attendees.

### COMPLEXITY

- [ ] No-code friendly
- [x] Soroban required
- [x] Mobile-first
- [x] Web app
- [ ] CLI/API only

### THEME

Finance & Payments:
- [ ] DeFi
- [ ] Payroll & salaries
- [ ] Remittance
- [x] Micropayments
- [ ] Savings & lending
- [ ] Cross-border B2B payments
- [ ] Split billing

Commerce & Loyalty:
- [ ] SME merchant payments
- [x] Marketplace escrow

## HARD RULES CHECK

- No vague "users": the primary user is a Web3 event attendee at a crowded crypto event in Manila.
- User-facing app: mobile web strategy and checklist app.
- Demo-able in a bootcamp: one strategy unlock and checklist start can be shown in under 2 minutes.
- Real money movement: attendee pays USDC or XLM on Stellar to unlock premium strategy content.
- Clear Stellar usage: Freighter signs the transaction, Soroban records the unlock, and Stellar settles the payment quickly and cheaply.
- 30-second pitch: "BoothScout helps Web3 event attendees pay through Freighter for the best booth-route strategy, unlock it through Soroban, and use it offline as a checklist to maximize swag without wasting time."

## OUTPUT STYLE

Clean, concise, concrete, and startup-like.

Avoid:
- Generic blockchain language.
- Abstract event platform wording.
- Unclear user personas.
- Overbuilding beyond one event and one paid strategy unlock.

## SOROBAN CONTRACT OUTPUT

For BoothScout, generate these four files. All code must be functional, compile-ready, and directly tied to the MVP unlock flow.

### lib.rs

Write the full Soroban smart contract in Rust.

Requirements:
- Include all necessary imports from `soroban_sdk`.
- Define a contract struct named `BoothScoutUnlock`.
- Define storage keys for:
  - admin
  - platform fee basis points
  - strategy metadata
  - unlock records
  - strategist earnings
  - platform earnings
- Public functions:
  - `initialize(admin: Address, platform_fee_bps: u32)`
  - `register_strategy(strategy_id: u64, strategist: Address, price: i128, asset: Address)`
  - `unlock_strategy(strategy_id: u64, buyer: Address)`
  - `has_unlock(strategy_id: u64, buyer: Address) -> bool`
  - `get_strategy(strategy_id: u64) -> Strategy`
  - `get_earnings(address: Address) -> i128`
- `unlock_strategy` must:
  - require buyer authorization
  - reject duplicate unlocks
  - transfer the strategy price from buyer to the contract or platform escrow using the Soroban token interface
  - calculate platform fee and strategist share
  - store the unlock
  - update earnings
  - publish an unlock event
- Add inline comments explaining what each function does and why.

### test.rs

Write exactly 5 tests using `soroban_sdk::testutils`, no more and no less.

Test 1: Happy path - buyer unlocks a strategy successfully end-to-end.
Test 2: Edge case - duplicate unlock fails.
Test 3: State verification - `has_unlock` returns true and storage reflects the unlock.
Test 4: Fee verification - platform fee and strategist share are calculated correctly.
Test 5: Authorization/payment failure - unregistered strategy or unauthorized buyer fails.

Use `#[cfg(test)]` and `mod tests`.

Mock all necessary setup with `Env::default()`.

### Cargo.toml

Requirements:
- `[package]` name: `booth_scout`
- `edition = "2021"`
- Include `soroban-sdk` under `[dependencies]`.
- Include `soroban-sdk` with `features = ["testutils"]` under `[dev-dependencies]`.
- Include `[lib]` with `crate-type = ["cdylib", "rlib"]`.
- Include `[profile.release]` optimized for Wasm output.

### README.md

Include:
- Project name: BoothScout.
- One-line description.
- Problem and solution.
- Timeline.
- Stellar features used.
- Vision and purpose.
- Prerequisites: Rust, Stellar CLI, Freighter wallet, Stellar Testnet account.
- How to build: `stellar contract build`.
- How to test: `cargo test`.
- How to deploy to testnet with `stellar contract deploy`.
- Sample CLI invocation calling `unlock_strategy` with dummy arguments.
- License: MIT.

## HOW TO DEPLOY GUIDE

Use Stellar Testnet for bootcamp demo:

1. Install Rust and the Stellar CLI.
2. Add the required Wasm target.
3. Build the Soroban contract with `stellar contract build`.
4. Deploy to Stellar Testnet with `stellar contract deploy`.
5. Configure the frontend with:
   - contract id
   - Stellar Testnet network passphrase
   - RPC URL
   - platform fee bps
6. Connect Freighter to Stellar Testnet.
7. Create one demo event.
8. Add 5-10 booths.
9. Register one paid strategy on the contract.
10. Run the unlock demo through Freighter.
11. Verify the app grants premium access only after the Soroban unlock is confirmed.
12. Press Start and show the offline checklist.

## EXAMPLE FRONTEND DEMO SCRIPT

1. Open BoothScout on mobile viewport.
2. Show event home: "ETH Manila Demo Summit."
3. Open Strategies.
4. Select "High-Value Swag Route: Morning Sprint."
5. Show locked full checklist.
6. Connect Freighter wallet on Testnet.
7. Pay 2 USDC or demo XLM through the Soroban unlock transaction.
8. Show transaction confirming.
9. Show strategy unlocked.
10. Press Start.
11. Disable network.
12. Refresh and show checklist still works offline.

## FINAL PITCH

BoothScout is a mobile web app for Web3 events where attendees pay through Freighter to unlock premium booth-route strategies on Stellar, then use those strategies as offline checklists to maximize valuable swag while avoiding long lines and low-value booth tasks.

## OFFICIAL STELLAR REFERENCES

- Freighter wallet docs: https://developers.stellar.org/docs/build/guides/freighter
- Soroban smart contract setup: https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup
- Stellar payments guide: https://developers.stellar.org/docs/build/guides/transactions/send-and-receive-payments
- Stellar CLI manual: https://developers.stellar.org/docs/tools/cli/stellar-cli
