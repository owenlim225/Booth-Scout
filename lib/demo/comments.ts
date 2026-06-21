import type { Comment } from "@/types/demo";

export const demoComments: Comment[] = [
  {
    id: "comment-ms-1",
    targetType: "strategy",
    targetId: "morning-sprint",
    author: "swag_hunter",
    body: "Followed this exactly and grabbed everything before 11 AM. Worth it.",
    context: "success",
    createdAt: "2026-07-14T11:20:00+08:00",
  },
  {
    id: "comment-ms-2",
    targetType: "strategy",
    targetId: "morning-sprint",
    author: "late_riser",
    body: "Soroban Lab pin was gone by the time I got there — go early!",
    context: "warning",
    createdAt: "2026-07-14T13:05:00+08:00",
  },
  {
    id: "comment-free-1",
    targetType: "strategy",
    targetId: "free-starter-loop",
    author: "first_timer",
    body: "Perfect for my first event, thank you!",
    context: "success",
    createdAt: "2026-07-13T10:15:00+08:00",
  },
  {
    id: "comment-booth-1",
    targetType: "booth",
    targetId: "soroban-lab",
    author: "dev_marco",
    body: "Quiz is easy if you skimmed the docs beforehand.",
    context: "update",
    createdAt: "2026-07-15T09:50:00+08:00",
  },
];

export function getSeedComments(
  targetType: Comment["targetType"],
  targetId: string
): Comment[] {
  return demoComments.filter(
    (comment) => comment.targetType === targetType && comment.targetId === targetId
  );
}
