# Implementation Plan: BoothScout MVP

## Task Type
- [x] Frontend (→ Gemini)
- [x] Backend (→ Codex)
- [x] Fullstack (→ Parallel)

## Context Summary

**Project state:** Greenfield Stellar hackathon MVP. Next.js 16.2.9 + React 19 + Tailwind 4 scaffold only (`app/page.tsx` default). No Soroban contract, no Stellar/Freighter integration, no API routes.

**Goal:** One demo-able transaction flow in under 2 minutes — attendee browses event → pays 2 USDC via Freighter → Soroban `unlock_strategy` → premium checklist revealed → Start → offline checklist survives refresh.

**Primary user:** Web3 event attendee at a crowded crypto conference in Manila.

---

## Technical Solution (Synthesized)

### Architecture

Hybrid fullstack with clear boundaries:

| Layer | Responsibility | Source of truth |
|-------|----------------|-----------------|
| **Soroban contract** | Payment, unlock receipt, fee split, earnings | On-chain |
| **Next.js app (public)** | Event/booth previews, locked strategy teaser | Static JSON |
| **Next.js API** | Premium content delivery gated by `has_unlock` | Server verifies chain |
| **Client (IndexedDB + SW)** | Checklist session, progress, offline shell | Local after Start |

### Consensus (Codex + Gemini)

1. **On-chain `has_unlock` is the unlock gate** — never reveal premium content from Freighter sign alone.
2. **Premium content stays off-chain** — contract stores strategy metadata (price, asset, strategist) only.
3. **Static JSON for demo data** — one event, 5–10 booths, one paid strategy; defer Supabase.
4. **USDC primary + XLM fallback** — register two strategies or swap asset at deploy time for demo resilience.
5. **Start is distinct from Unlock** — checklist caches to IndexedDB only after explicit Start tap.
6. **Mobile-first shell** — `max-w-md`, sticky bottom CTAs, 48–56px touch targets, Testnet banner.
7. **Three decoupled state domains** — content (static), entitlement (chain), checklist session (IndexedDB).

### Key Decisions

- **Platform treasury = admin address** at init (no extra storage key for MVP).
- **Token flow:** buyer → contract escrow → split to admin (platform fee) + strategist.
- **USDC price:** `20_000_000` (2 USDC × 10^7 decimals).
- **Platform fee:** 500 bps (5%) → 0.10 USDC platform, 1.90 USDC strategist.
- **State management:** thin hooks for wallet/payment FSM; IndexedDB for checklist; optional Zustand if stores grow.
- **PWA:** manual `public/sw.js` + `app/manifest.ts`; checklist content from IndexedDB, SW caches JS shell.

---

## Implementation Steps

### Phase 0 — Prerequisites & Environment

**Deliverable:** Dev environment ready for contract + frontend.

1. Install Rust, `wasm32-unknown-unknown` target, Stellar CLI.
2. Install Freighter, create Testnet accounts (deployer, buyer, strategist).
3. Fund buyer with Testnet USDC (or XLM SAC fallback).
4. Create `.env.example` and `.env.local`:

```env
NEXT_PUBLIC_SOROBAN_RPC=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_CONTRACT_ID=
NEXT_PUBLIC_USDC_CONTRACT=
NEXT_PUBLIC_DEMO_STRATEGY_ID=1
NEXT_PUBLIC_PLATFORM_FEE_BPS=500
```

---

### Phase 1 — Soroban Contract (P0)

**Deliverable:** `contracts/booth_scout/` with 5/5 passing tests.

#### 1.1 Create contract workspace

```
contracts/booth_scout/
├── Cargo.toml
├── src/
│   ├── lib.rs
│   └── test.rs
└── README.md
```

**Cargo.toml** per spec: package `booth_scout`, edition 2021, `soroban-sdk` deps, `cdylib` + `rlib`, release profile for Wasm.

#### 1.2 Implement `BoothScoutUnlock` (`lib.rs`)

```rust
// Storage keys
enum DataKey {
    Admin,                        // Address
    PlatformFeeBps,               // u32
    Strategy(u64),                  // Strategy { strategist, price, asset, active }
    Unlock(u64, Address),         // (strategy_id, buyer) → bool
    StrategistEarnings(Address),  // i128
    PlatformEarnings,             // i128
}

// Public functions
initialize(admin, platform_fee_bps)     // admin.require_auth(); one-time
register_strategy(id, strategist, price, asset)  // admin.require_auth()
unlock_strategy(strategy_id, buyer)     // buyer.require_auth(); core flow
has_unlock(strategy_id, buyer) -> bool
get_strategy(strategy_id) -> Strategy
get_earnings(address) -> i128
```

**`unlock_strategy` pseudo-code:**

```rust
fn unlock_strategy(env, strategy_id, buyer) {
    buyer.require_auth();
    if has_unlock(env, strategy_id, buyer.clone()) { return Err(AlreadyUnlocked); }

    let strategy = load_strategy(strategy_id)?;
    let bps = load_platform_fee_bps();
    let platform_fee = strategy.price * bps as i128 / 10_000;
    let strategist_share = strategy.price - platform_fee;

    let token = TokenClient::new(&env, &strategy.asset);
    let contract = env.current_contract_address();
    let admin = load_admin();

    token.transfer(&buyer, &contract, &strategy.price);
    token.transfer(&contract, &admin, &platform_fee);
    token.transfer(&contract, &strategy.strategist, &strategist_share);

    store_unlock(strategy_id, buyer);
    update_earnings(admin, strategist, platform_fee, strategist_share);
    emit_unlock_event(...);
    Ok(())
}
```

#### 1.3 Write exactly 5 tests (`test.rs`)

| # | Test | Assert |
|---|------|--------|
| 1 | Happy path | unlock succeeds; balances + `has_unlock` true |
| 2 | Duplicate unlock | second call returns `AlreadyUnlocked` |
| 3 | State verification | `has_unlock` false → true; storage consistent |
| 4 | Fee verification | platform 1_000_000 + strategist 19_000_000 on 20_000_000 price @ 500 bps |
| 5 | Auth/payment failure | unregistered strategy fails; unauthorized buyer fails |

Run: `cd contracts/booth_scout && cargo test`

#### 1.4 Contract README

Per spec: build (`stellar contract build`), test (`cargo test`), deploy, sample `unlock_strategy` CLI invocation, MIT license.

---

### Phase 2 — Deploy & Register Demo Strategy (P1)

**Deliverable:** Contract live on Testnet with strategy_id=1 registered.

```bash
stellar contract build
stellar contract deploy --wasm ... --source deployer --network testnet

stellar contract invoke --id $CONTRACT_ID -- register_strategy \
  --strategy_id 1 --strategist $STRATEGIST --price 20000000 --asset $USDC

stellar contract invoke --id $CONTRACT_ID -- initialize \
  --admin $ADMIN --platform_fee_bps 500
```

**Exit criteria:** CLI `unlock_strategy` smoke test succeeds; `has_unlock` returns true.

---

### Phase 3 — Demo Data & API Layer (P2)

**Deliverable:** Static event data + server-gated premium endpoint.

#### 3.1 Seed data files

```
lib/demo/
├── events.ts          # ETH Manila Demo Summit
├── booths.ts          # 5–10 sponsor booths
└── strategies.ts      # morning-sprint strategy
```

**Strategy shape:**

```typescript
type Strategy = {
  id: "morning-sprint";
  contractStrategyId: 1n;
  title: "High-Value Swag Route: Morning Sprint";
  priceUsdc: 2;
  teaser: string;
  previewStops: string[];           // 2–3 booth names (free)
  premium: {
    fullDescription: string;
    orderedBooths: ChecklistBooth[];
    timingNotes: string;
  };
};
```

#### 3.2 Premium API route

```
app/api/strategies/[id]/premium/route.ts
```

```typescript
// GET /api/strategies/morning-sprint/premium?buyer=G...
export async function GET(req, { params }) {
  const buyer = validateStellarAddress(req.nextUrl.searchParams.get("buyer"));
  const strategy = getStrategy(params.id);
  const unlocked = await simulateHasUnlock(strategy.contractStrategyId, buyer);
  if (!unlocked) return Response.json({ error: "Locked" }, { status: 403 });
  return Response.json({ premium: strategy.premium });
}
```

**Security:** Never embed premium JSON in client bundle or public static files.

---

### Phase 4 — Stellar Client Library (P2)

**Deliverable:** `lib/stellar/*` modules wired to env config.

```
lib/stellar/
├── config.ts           # RPC, contract ID, network passphrase
├── freighter.ts        # connect, network guard, sign
├── contract-client.ts  # simulate + invoke helpers
└── unlock-flow.ts      # build → sign → submit → poll → has_unlock
```

**Unlock flow pseudo-code:**

```typescript
async function unlockAndVerify(strategyId: bigint, buyer: string) {
  await ensureFreighterTestnet();
  const tx = buildUnlockTx({ contractId, strategyId, buyer });
  setState("signing");
  const signed = await freighterSignTransaction(tx.toXDR());
  setState("submitting");
  const hash = await rpc.sendTransaction(signed);
  setState("confirming");
  await pollUntilConfirmed(hash, { timeoutMs: 60_000 });
  const unlocked = await simulateHasUnlock(contractId, strategyId, buyer);
  if (!unlocked) throw new UnlockVerificationError();
  cacheUnlockReceipt({ strategyId, buyer, hash });
  setState("success");
  return { hash };
}
```

**Dependencies to add:**

```json
{
  "@stellar/freighter-api": "^...",
  "@stellar/stellar-sdk": "^...",
  "idb-keyval": "^6"
}
```

---

### Phase 5 — Frontend Routes & UI Shell (P3)

**Deliverable:** Mobile-first demo navigation without chain (mock unlock OK initially).

#### 5.1 Route structure

```
app/
├── layout.tsx                              # Providers, SW registration
├── manifest.ts                             # PWA manifest
├── (demo)/events/[slug]/
│   ├── layout.tsx                          # AppShell, EventHeader, BottomNav
│   ├── page.tsx                            # Event home
│   ├── strategies/
│   │   ├── page.tsx                        # Strategy list
│   │   └── [strategyId]/page.tsx           # Strategy detail
│   └── checklist/[runId]/page.tsx          # Offline checklist
```

**Demo URLs:**
- `/events/eth-manila-demo-summit`
- `/events/eth-manila-demo-summit/strategies/morning-sprint`
- `/events/eth-manila-demo-summit/checklist/{runId}`

#### 5.2 Component hierarchy

```
components/
├── layout/     AppShell, EventHeader, BottomNav, OfflineBanner, DemoBanner
├── event/      EventHero, BoothGrid, BoothCard
├── strategy/   StrategyPreview, StrategyFull, UnlockPanel, PaymentStatus
├── checklist/  ChecklistHeader, BoothStep, RequirementRow, SwagBadge, FallbackNote
└── wallet/     ConnectFreighterButton, WalletChip, NetworkGuard
```

#### 5.3 Mobile layout rules

- Design at 390×844; `max-w-md mx-auto`
- Sticky bottom CTA above bottom nav (`pb-[calc(4.5rem+safe-area)]`)
- Touch targets: 48–56px minimum
- Testnet banner: "Demo mode · Stellar Testnet · 2 USDC not real money"

---

### Phase 6 — Wallet & Payment UX (P3)

**Deliverable:** Full Freighter + Soroban unlock flow with FSM-driven UI.

#### 6.1 Payment state machine

```
idle → building → signing → submitting → confirming → success | error
```

#### 6.2 UnlockPanel UI mapping

| State | Primary CTA | UI |
|-------|-------------|-----|
| No wallet | Connect Freighter | Explainer: "Pay 2 USDC on Testnet" |
| connecting | Disabled | "Opening Freighter…" |
| connected | Pay 2 USDC | WalletChip + price |
| signing | Disabled | "Confirm in Freighter" |
| confirming | Disabled | Stepper: Submitted → Ledger → Verified |
| success | Start Route | Full content revealed |
| error | Retry | Human message + recovery hint |

#### 6.3 Locked vs unlocked pattern

**Locked (`StrategyPreview`):**
- Show teaser + 2–3 preview booth names
- Blurred remaining checklist (`aria-hidden` on blur layer)
- Screen reader: "Premium content locked"

**Unlocked (`StrategyFull`):**
- Full ordered booths, requirements, swag, fallback notes
- Start Route button

**Gating rule:**

```typescript
// NEVER set isUnlocked from payment click alone
const isUnlocked =
  paymentState === "success" ||
  (address && (await verifyHasUnlock(strategyId, address)));
```

---

### Phase 7 — Offline Checklist (P4)

**Deliverable:** Start → IndexedDB → refresh offline works.

#### 7.1 Checklist run model

```typescript
type ChecklistRun = {
  runId: string;
  eventSlug: string;
  strategyId: string;
  startedAt: string;
  booths: (ChecklistBooth & { completed: boolean; skipped: boolean })[];
};
```

#### 7.2 Start flow

```typescript
async function startChecklist(strategy, slug) {
  const runId = crypto.randomUUID();
  const run = buildRunFromStrategy(strategy, runId, slug);
  await saveChecklistRun(run);          // IndexedDB
  await setActiveRunId(slug, runId);
  router.push(`/events/${slug}/checklist/${runId}`);
}
```

#### 7.3 Checklist UX

- Ordered booth cards with checkbox, requirements, swag badges, fallback notes
- Sticky progress: "4/10 complete"
- Active booth highlighted with ring border
- Offline banner when `navigator.onLine === false`

#### 7.4 PWA / Service worker

- `app/manifest.ts` — standalone, theme color, icons
- `public/sw.js` — cache app shell (JS/CSS); checklist data from IndexedDB
- Register SW in client layout effect
- **Rehearse on production build** (`next build && next start`) — not just `next dev`

---

### Phase 8 — Integration & Demo Polish (P5)

**Deliverable:** End-to-end demo under 2 minutes.

1. Wire real unlock flow replacing mock.
2. Add XLM fallback banner if USDC unavailable.
3. Handle `has_unlock` on page load (skip pay if already unlocked).
4. Accessibility pass: contrast, tap targets, `aria-live` on payment states.
5. Update root metadata: title "BoothScout", description from spec pitch.
6. Full rehearsal script:

| Time | Action |
|------|--------|
| 0:00 | Open event home (mobile viewport) |
| 0:20 | Open Morning Sprint strategy (locked preview) |
| 0:30 | Connect Freighter Testnet |
| 0:40 | Pay 2 USDC |
| 1:05 | Unlocked → full route visible |
| 1:10 | Press Start → checklist |
| 1:30 | Airplane mode → refresh → checklist persists |

---

## Key Files

| File | Operation | Description |
|------|-----------|-------------|
| `contracts/booth_scout/Cargo.toml` | Create | Soroban package config per spec |
| `contracts/booth_scout/src/lib.rs` | Create | `BoothScoutUnlock` contract |
| `contracts/booth_scout/src/test.rs` | Create | Exactly 5 tests |
| `contracts/booth_scout/README.md` | Create | Build/deploy docs |
| `lib/stellar/config.ts` | Create | Network + contract env config |
| `lib/stellar/freighter.ts` | Create | Wallet connect + Testnet guard |
| `lib/stellar/unlock-flow.ts` | Create | Sign → submit → poll → verify |
| `lib/stellar/contract-client.ts` | Create | Soroban simulate/invoke helpers |
| `lib/demo/events.ts` | Create | ETH Manila demo event seed |
| `lib/demo/strategies.ts` | Create | Morning Sprint strategy data |
| `lib/storage/checklist-store.ts` | Create | IndexedDB checklist CRUD |
| `lib/storage/unlock-cache.ts` | Create | Local unlock receipt cache |
| `lib/hooks/usePaymentFlow.ts` | Create | Payment FSM hook |
| `lib/hooks/useWallet.ts` | Create | Freighter wallet hook |
| `app/api/strategies/[id]/premium/route.ts` | Create | Gated premium content API |
| `app/(demo)/events/[slug]/page.tsx` | Create | Event home |
| `app/(demo)/events/[slug]/strategies/[strategyId]/page.tsx` | Create | Strategy detail + unlock |
| `app/(demo)/events/[slug]/checklist/[runId]/page.tsx` | Create | Offline checklist |
| `components/strategy/UnlockPanel.tsx` | Create | Payment UX states |
| `components/strategy/StrategyPreview.tsx` | Create | Locked content pattern |
| `components/checklist/BoothStep.tsx` | Create | Checklist booth card |
| `components/layout/AppShell.tsx` | Create | Mobile shell |
| `components/layout/OfflineBanner.tsx` | Create | Offline indicator |
| `app/manifest.ts` | Create | PWA manifest |
| `public/sw.js` | Create | Service worker for offline shell |
| `app/layout.tsx` | Modify | Providers, metadata, SW registration |
| `app/page.tsx` | Modify | Redirect to demo event |
| `app/globals.css` | Modify | Design tokens, tap targets |
| `package.json` | Modify | Add Stellar + idb-keyval deps |
| `.env.example` | Create | Public Stellar config template |

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| USDC Testnet funding fails | Demo payment blocked | Pre-fund buyer; register XLM fallback strategy |
| Premium content leaked in bundle | Unlock meaningless | Server-gated API only; no premium in static files |
| Freighter wrong network | Silent tx failure | Hard Testnet guard before sign; inline error |
| Optimistic unlock UI | Trust loss | Gate on `has_unlock` only, never on sign |
| SW not registered in dev | Offline demo fails | Rehearse on production build |
| RPC timeout during demo | Stuck confirming | Re-poll + re-check `has_unlock`; show tx hash link |
| Soroban SDK version drift | Build breaks | Pin versions in Cargo.toml + README |
| Start/Unlock conflation | Offline step fails | Separate Start action + IndexedDB write |
| Mobile Freighter UX slow | Over 2 min demo | Pre-connect wallet; bookmark strategy URL |

---

## Open Questions (Resolve During Implementation)

1. **Platform fee recipient:** Use admin address as treasury (recommended for MVP).
2. **Withdrawals:** `get_earnings` is display-only for demo; no `withdraw` function in MVP.
3. **Admin UI:** JSON edit acceptable for bootcamp; no admin panel in MVP.
4. **Premium API auth:** Query param `buyer` sufficient for MVP (attacker needs on-chain unlock anyway).
5. **XLM fallback:** Register `strategy_id=2` with XLM SAC if USDC setup blocked.

---

## Acceptance Criteria

- [ ] Soroban contract compiles; exactly 5 tests pass
- [ ] Contract deployed on Stellar Testnet; strategy_id=1 registered at 2 USDC
- [ ] Freighter connect + Testnet guard works on mobile viewport
- [ ] `unlock_strategy` tx succeeds; app verifies via `has_unlock` before revealing premium
- [ ] Premium content not accessible without on-chain unlock
- [ ] Start saves checklist to IndexedDB; progress survives offline refresh
- [ ] Full demo script completes in under 2 minutes
- [ ] Demo event "ETH Manila Demo Summit" with 5–10 booths renders

---

## SESSION_ID (for /ccg:execute use)

Analysis performed via parallel role agents (Codex backend + Gemini frontend) after `ccg-workflow init` provisioned the runtime. No persistent wrapper sessions were captured for this planning run.

- **CODEX_SESSION:** N/A — start fresh execute session
- **GEMINI_SESSION:** N/A — start fresh execute session

To execute, use a new session:

```
/ccg:execute .claude/plan/boothscout-mvp.md
```
