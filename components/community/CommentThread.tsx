"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { addComment, listComments } from "@/lib/storage/community-store";
import { Badge } from "@/components/ui/Badge";
import type { Comment, CommentContext, CommunityTarget } from "@/types/demo";

type CommentThreadProps = {
  targetType: CommunityTarget;
  targetId: string;
  author: string | null;
};

const contexts: CommentContext[] = ["success", "problem", "update", "warning", "other"];

const contextTone: Record<CommentContext, "free" | "warning" | "fresh" | "neutral"> = {
  success: "free",
  problem: "warning",
  warning: "warning",
  update: "fresh",
  other: "neutral",
};

function shortAuthor(author: string): string {
  if (author.length > 12 && /^G[A-Z2-7]{55}$/.test(author)) {
    return `${author.slice(0, 4)}…${author.slice(-4)}`;
  }
  return author;
}

export function CommentThread({ targetType, targetId, author }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [context, setContext] = useState<CommentContext>("success");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void listComments(targetType, targetId).then(setComments);
  }, [targetType, targetId]);

  const submit = async () => {
    if (!author) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addComment({ targetType, targetId, author, body, context });
      await track("comment_created", { targetType, targetId, context });
      setBody("");
      const refreshed = await listComments(targetType, targetId);
      setComments(refreshed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Community ({comments.length})</h2>

      {author ? (
        <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-1.5">
            {contexts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setContext(value)}
                aria-pressed={context === value}
                className={`min-h-9 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  context === value
                    ? "bg-zinc-950 text-white"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Share how the route or booth worked out…"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <button
            type="button"
            onClick={submit}
            disabled={submitting || !body.trim()}
            className="min-h-11 w-full rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Connect Freighter to comment, like, or report.
        </p>
      )}

      <ul className="space-y-2">
        {comments.length === 0 ? (
          <li className="text-sm text-zinc-500">No comments yet. Be the first.</li>
        ) : null}
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-zinc-500">
                {shortAuthor(comment.author)}
              </span>
              <Badge tone={contextTone[comment.context]}>{comment.context}</Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-800 break-words">{comment.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
