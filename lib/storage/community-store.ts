import { get, set } from "idb-keyval";
import { getSeedComments } from "@/lib/demo/comments";
import type {
  Comment,
  CommentContext,
  CommunityTarget,
  Reaction,
  ReactionKind,
  Report,
  ReportTarget,
  Strategy,
} from "@/types/demo";

const commentsKey = (targetType: CommunityTarget, targetId: string) =>
  `community:comments:${targetType}:${targetId}`;
const reactionsKey = (targetType: CommunityTarget, targetId: string) =>
  `community:reactions:${targetType}:${targetId}`;
const reportsKey = "community:reports";
const localStrategiesKey = "community:strategies";

const randomId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID?.() ?? Date.now().toString(36)}`;

export async function listComments(
  targetType: CommunityTarget,
  targetId: string
): Promise<Comment[]> {
  const stored = (await get<Comment[]>(commentsKey(targetType, targetId))) ?? [];
  const seeds = getSeedComments(targetType, targetId);
  const merged = [...seeds, ...stored];
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addComment(input: {
  targetType: CommunityTarget;
  targetId: string;
  author: string;
  body: string;
  context: CommentContext;
}): Promise<Comment> {
  const trimmed = input.body.trim();
  if (!trimmed) {
    throw new Error("Comment cannot be empty.");
  }
  if (trimmed.length > 1000) {
    throw new Error("Comment is too long (max 1000 characters).");
  }
  const comment: Comment = {
    id: randomId("comment"),
    targetType: input.targetType,
    targetId: input.targetId,
    author: input.author,
    body: trimmed,
    context: input.context,
    createdAt: new Date().toISOString(),
  };
  const key = commentsKey(input.targetType, input.targetId);
  const stored = (await get<Comment[]>(key)) ?? [];
  await set(key, [...stored, comment]);
  return comment;
}

export async function getReaction(
  targetType: CommunityTarget,
  targetId: string,
  author: string
): Promise<ReactionKind | null> {
  const stored = (await get<Reaction[]>(reactionsKey(targetType, targetId))) ?? [];
  return stored.find((reaction) => reaction.author === author)?.reaction ?? null;
}

export async function setReaction(input: {
  targetType: CommunityTarget;
  targetId: string;
  author: string;
  reaction: ReactionKind | null;
}): Promise<void> {
  const key = reactionsKey(input.targetType, input.targetId);
  const stored = (await get<Reaction[]>(key)) ?? [];
  const without = stored.filter((reaction) => reaction.author !== input.author);
  if (input.reaction) {
    without.push({
      targetType: input.targetType,
      targetId: input.targetId,
      author: input.author,
      reaction: input.reaction,
    });
  }
  await set(key, without);
}

export async function listReports(): Promise<Report[]> {
  return (await get<Report[]>(reportsKey)) ?? [];
}

export async function addReport(input: {
  targetType: ReportTarget;
  targetId: string;
  reporter: string;
  reason: string;
}): Promise<Report> {
  const trimmed = input.reason.trim();
  if (!trimmed) {
    throw new Error("Report reason cannot be empty.");
  }
  const report: Report = {
    id: randomId("report"),
    targetType: input.targetType,
    targetId: input.targetId,
    reporter: input.reporter,
    reason: trimmed,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  const stored = await listReports();
  await set(reportsKey, [report, ...stored]);
  return report;
}

export async function updateReportStatus(
  reportId: string,
  status: Report["status"]
): Promise<void> {
  const stored = await listReports();
  await set(
    reportsKey,
    stored.map((report) => (report.id === reportId ? { ...report, status } : report))
  );
}

export async function listLocalStrategies(): Promise<Strategy[]> {
  return (await get<Strategy[]>(localStrategiesKey)) ?? [];
}

export async function saveLocalStrategy(strategy: Strategy): Promise<void> {
  const stored = await listLocalStrategies();
  const without = stored.filter((item) => item.id !== strategy.id);
  await set(localStrategiesKey, [strategy, ...without]);
}
