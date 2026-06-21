"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { getReaction, setReaction } from "@/lib/storage/community-store";
import type { CommunityTarget, ReactionKind } from "@/types/demo";

type ReactionBarProps = {
  targetType: CommunityTarget;
  targetId: string;
  author: string | null;
  likes: number;
  dislikes: number;
};

export function ReactionBar({
  targetType,
  targetId,
  author,
  likes,
  dislikes,
}: ReactionBarProps) {
  const [mine, setMine] = useState<ReactionKind | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = author ? await getReaction(targetType, targetId, author) : null;
      if (!cancelled) {
        setMine(next);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [author, targetType, targetId]);

  const react = async (reaction: ReactionKind) => {
    if (!author) {
      return;
    }
    const next = mine === reaction ? null : reaction;
    setMine(next);
    await setReaction({ targetType, targetId, author, reaction: next });
    if (next) {
      await track("reaction_created", { targetType, targetId, reaction: next });
    }
  };

  const likeCount = likes + (mine === "like" ? 1 : 0);
  const dislikeCount = dislikes + (mine === "dislike" ? 1 : 0);
  const disabled = !author;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => react("like")}
        disabled={disabled}
        aria-pressed={mine === "like"}
        aria-label="Like"
        className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
          mine === "like"
            ? "border-emerald-400 bg-emerald-50 text-emerald-800"
            : "border-zinc-300 text-zinc-700"
        }`}
      >
        ▲ {likeCount}
      </button>
      <button
        type="button"
        onClick={() => react("dislike")}
        disabled={disabled}
        aria-pressed={mine === "dislike"}
        aria-label="Dislike"
        className={`inline-flex min-h-11 items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${
          mine === "dislike"
            ? "border-rose-400 bg-rose-50 text-rose-800"
            : "border-zinc-300 text-zinc-700"
        }`}
      >
        ▼ {dislikeCount}
      </button>
      {disabled ? (
        <span className="text-xs text-zinc-500">Connect to react</span>
      ) : null}
    </div>
  );
}
