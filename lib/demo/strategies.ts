import { demoEvent } from "@/lib/demo/events";
import type { Strategy } from "@/types/demo";

const slug = demoEvent.slug;

export const demoStrategies: Strategy[] = [
  {
    id: "morning-sprint",
    eventSlug: slug,
    contractStrategyId: 1,
    creatorName: "RouteRunner",
    title: "High-Value Swag Route: Morning Sprint",
    summary:
      "Beat the lines before noon with a 45-minute route tuned for high-value swag drops.",
    fullText:
      "Start with infrastructure booths before queues spike, then branch to activation booths while lunch sessions absorb foot traffic. This route prioritizes high-value, low-hassle swag and keeps a steady pace so you never wait more than ~12 minutes per booth.",
    visibility: "paid",
    priceAmount: 2,
    priceAsset: "USDC",
    status: "published",
    followsRulesAttested: true,
    estimatedMinutes: 45,
    valueRating: "high",
    hassleRating: "low",
    likesCount: 42,
    dislikesCount: 3,
    commentsCount: 2,
    publishedAt: "2026-07-10T12:00:00+08:00",
    updatedAt: "2026-07-14T09:00:00+08:00",
    previewSteps: ["Stellar Hub", "Soroban Lab", "Validator Lounge"],
    steps: [
      {
        order: 1,
        boothId: "stellar-hub",
        actionText: "Claim the Stellar tote first while the quick-claim lane is empty.",
        rationale: "Anchor booth fills fast after 10 AM.",
        expectedSwag: "Stellar tote + sticker pack",
        fallbackIfLineLong: "Skip to Soroban Lab and return after lunch.",
      },
      {
        order: 2,
        boothId: "soroban-lab",
        actionText: "Take the 2-minute contract quiz for the limited pin.",
        rationale: "Pins are limited; grab early.",
        expectedSwag: "Limited enamel pin",
        fallbackIfLineLong: "Use the paper quiz at the side desk.",
      },
      {
        order: 3,
        boothId: "validator-lounge",
        actionText: "Answer trivia for socks + keycap and recharge in the lounge.",
        rationale: "Highest value-to-hassle ratio on the floor.",
        expectedSwag: "Socks + keycap",
        fallbackIfLineLong: "Trivia repeats every 20 minutes.",
      },
      {
        order: 4,
        boothId: "dex-district",
        actionText: "Run one testnet swap simulation for the tumbler.",
        rationale: "Mid-morning is quietest here.",
        expectedSwag: "Branded tumbler",
        fallbackIfLineLong: "Screenshot the swap first in case the kiosk drops.",
      },
      {
        order: 5,
        boothId: "wallet-square",
        actionText: "Install + scan QR for the phone stand.",
        rationale: "Low value, but on the way out.",
        expectedSwag: "Phone stand",
        fallbackIfLineLong: "Use the buddy referral lane.",
      },
      {
        order: 6,
        boothId: "builder-alley",
        actionText: "Catch a lightning talk and grab the notebook + lanyard.",
        rationale: "Good cooldown before afternoon sessions.",
        expectedSwag: "Notebook + lanyard",
        fallbackIfLineLong: "Collect the stamp from the side desk.",
      },
    ],
    images: [],
  },
  {
    id: "collectors-circuit",
    eventSlug: slug,
    contractStrategyId: 2,
    creatorName: "PinCollector",
    title: "Collector's Circuit: Limited Drops Only",
    summary:
      "A focused loop hitting only the limited and high-value collectibles before they run out.",
    fullText:
      "If you only care about rare items, this tight loop targets the limited pin and high-value apparel first, ignoring everything low-value. Designed to finish in under 30 minutes.",
    visibility: "paid",
    priceAmount: 3,
    priceAsset: "USDC",
    status: "published",
    followsRulesAttested: true,
    estimatedMinutes: 28,
    valueRating: "high",
    hassleRating: "medium",
    likesCount: 19,
    dislikesCount: 1,
    commentsCount: 0,
    publishedAt: "2026-07-12T15:00:00+08:00",
    updatedAt: "2026-07-13T15:00:00+08:00",
    previewSteps: ["Soroban Lab", "Validator Lounge"],
    steps: [
      {
        order: 1,
        boothId: "soroban-lab",
        actionText: "Grab the limited pin before the morning rush.",
        rationale: "Most likely item to sell out.",
        expectedSwag: "Limited enamel pin",
        fallbackIfLineLong: "Return at the top of the next hour.",
      },
      {
        order: 2,
        boothId: "validator-lounge",
        actionText: "Claim socks + keycap.",
        rationale: "High value, consistently short line.",
        expectedSwag: "Socks + keycap",
        fallbackIfLineLong: "Trivia repeats every 20 minutes.",
      },
      {
        order: 3,
        boothId: "stellar-hub",
        actionText: "Pick up the tote on the way out.",
        rationale: "Solid value, central location.",
        expectedSwag: "Stellar tote + sticker pack",
        fallbackIfLineLong: "Quick-claim lane after lunch.",
      },
    ],
    images: [],
  },
  {
    id: "free-starter-loop",
    eventSlug: slug,
    creatorName: "BoothScout Team",
    title: "Free Starter Loop: First-Timer Friendly",
    summary:
      "A relaxed, free route for first-time attendees who want a taste of the floor without stress.",
    fullText:
      "New to Web3 events? This free loop keeps it simple: three easy booths with low-hassle requirements and friendly staff. No rush, no rare-item pressure.",
    visibility: "free",
    priceAmount: 0,
    priceAsset: "USDC",
    status: "published",
    followsRulesAttested: true,
    estimatedMinutes: 25,
    valueRating: "medium",
    hassleRating: "low",
    likesCount: 31,
    dislikesCount: 2,
    commentsCount: 1,
    publishedAt: "2026-07-08T10:00:00+08:00",
    updatedAt: "2026-07-08T10:00:00+08:00",
    previewSteps: ["Builder Alley", "Stellar Hub", "Wallet Square"],
    steps: [
      {
        order: 1,
        boothId: "builder-alley",
        actionText: "Start with a lightning talk to get oriented.",
        rationale: "Lowest pressure entry point.",
        expectedSwag: "Notebook + lanyard",
        fallbackIfLineLong: "Grab the stamp from the side desk.",
      },
      {
        order: 2,
        boothId: "stellar-hub",
        actionText: "Say hi and claim the tote.",
        rationale: "Friendly staff, central spot.",
        expectedSwag: "Stellar tote + sticker pack",
        fallbackIfLineLong: "Return after lunch.",
      },
      {
        order: 3,
        boothId: "wallet-square",
        actionText: "Set up a wallet and grab the phone stand.",
        rationale: "Useful even after the event.",
        expectedSwag: "Phone stand",
        fallbackIfLineLong: "Use the buddy referral lane.",
      },
    ],
    images: [],
  },
  {
    id: "low-hassle-lunch",
    eventSlug: slug,
    creatorName: "EasyMode",
    title: "Low-Hassle Lunch Lap",
    summary: "A free midday lap that avoids quizzes and long requirements entirely.",
    fullText:
      "Hate quizzes and installs? This free lap only hits booths with show-and-claim or trivia requirements. Best run during lunch when lines thin out.",
    visibility: "free",
    priceAmount: 0,
    priceAsset: "USDC",
    status: "published",
    followsRulesAttested: true,
    estimatedMinutes: 20,
    valueRating: "medium",
    hassleRating: "low",
    likesCount: 12,
    dislikesCount: 0,
    commentsCount: 0,
    publishedAt: "2026-07-11T11:00:00+08:00",
    updatedAt: "2026-07-11T11:00:00+08:00",
    previewSteps: ["Validator Lounge", "Stellar Hub"],
    steps: [
      {
        order: 1,
        boothId: "validator-lounge",
        actionText: "Answer trivia for socks + keycap.",
        rationale: "No install, just trivia.",
        expectedSwag: "Socks + keycap",
        fallbackIfLineLong: "Repeats every 20 minutes.",
      },
      {
        order: 2,
        boothId: "stellar-hub",
        actionText: "Show your address for the tote.",
        rationale: "Show-and-claim, quick.",
        expectedSwag: "Stellar tote + sticker pack",
        fallbackIfLineLong: "Quick-claim lane after lunch.",
      },
    ],
    images: [],
  },
];

export function getStrategyById(id: string): Strategy | undefined {
  return demoStrategies.find((strategy) => strategy.id === id);
}

export function getPublishedStrategies(): Strategy[] {
  return demoStrategies.filter((strategy) => strategy.status === "published");
}

// Backward-compatible alias for the original demo entry point.
export const morningSprintStrategy = demoStrategies[0];
