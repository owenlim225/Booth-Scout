export type EventStatus = "draft" | "live" | "ended" | "archived";
export type RatingLevel = "low" | "medium" | "high";
export type CrowdLevel = "empty" | "short" | "medium" | "long" | "packed";
export type Availability = "unknown" | "available" | "limited" | "gone";
export type Visibility = "free" | "paid";
export type PriceAsset = "USDC" | "XLM";
export type CommentContext = "success" | "problem" | "update" | "warning" | "other";
export type ReactionKind = "like" | "dislike";
export type CommunityTarget = "strategy" | "booth" | "swag_offer";
export type ReportTarget = "strategy" | "comment" | "booth" | "swag_offer";

export type EventSummary = {
  slug: string;
  name: string;
  city: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  status: EventStatus;
  description: string;
  heroImageUrl?: string;
  testnetNotice: string;
};

export type SwagOffer = {
  id: string;
  boothId: string;
  itemName: string;
  itemType: string;
  requirement: string;
  estimatedValue: RatingLevel;
  hassleLevel: RatingLevel;
  availability: Availability;
};

export type Booth = {
  id: string;
  eventSlug: string;
  sponsorName: string;
  name: string;
  boothNumber: string;
  category: string;
  description: string;
  officialUrl?: string;
  adminVerified: boolean;
  // Core checklist fields (kept flat for offline checklist snapshots).
  requirement: string;
  swag: string;
  fallbackNote: string;
};

export type LineReport = {
  id: string;
  boothId: string;
  reporter: string;
  crowdLevel: CrowdLevel;
  estimatedWaitMinutes: number;
  note: string;
  createdAt: string;
};

export type StrategyStep = {
  order: number;
  boothId: string;
  actionText: string;
  rationale: string;
  expectedSwag: string;
  fallbackIfLineLong: string;
};

export type StrategyImage = {
  url: string;
  altText: string;
  position: number;
};

export type Strategy = {
  id: string;
  eventSlug: string;
  contractStrategyId?: number;
  creatorName: string;
  creatorAddress?: string;
  title: string;
  summary: string;
  fullText: string;
  visibility: Visibility;
  priceAmount: number;
  priceAsset: PriceAsset;
  status: "draft" | "published" | "hidden" | "removed";
  followsRulesAttested: boolean;
  estimatedMinutes: number;
  valueRating: RatingLevel;
  hassleRating: RatingLevel;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  publishedAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  previewSteps: string[];
  steps: StrategyStep[];
  images: StrategyImage[];
};

export type Comment = {
  id: string;
  targetType: CommunityTarget;
  targetId: string;
  author: string;
  body: string;
  context: CommentContext;
  createdAt: string;
};

export type Reaction = {
  targetType: CommunityTarget;
  targetId: string;
  author: string;
  reaction: ReactionKind;
};

export type Report = {
  id: string;
  targetType: ReportTarget;
  targetId: string;
  reporter: string;
  reason: string;
  status: "open" | "reviewed" | "actioned" | "dismissed";
  createdAt: string;
};

// Checklist snapshot types (offline-ready, persisted in IndexedDB).
export type ChecklistRunBooth = {
  id: string;
  order: number;
  name: string;
  category: string;
  requirement: string;
  swag: string;
  fallbackNote: string;
  actionText: string;
  completed: boolean;
  skipped: boolean;
  note?: string;
};

export type ChecklistRun = {
  runId: string;
  eventSlug: string;
  strategyId: string;
  strategyTitle: string;
  startedAt: string;
  lastSyncedAt?: string;
  syncStatus: "local_only" | "synced" | "conflict";
  booths: ChecklistRunBooth[];
};

export type AnalyticsEvent = {
  id: string;
  name: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
};
