"use client";

import { CommentThread } from "@/components/community/CommentThread";
import { ReactionBar } from "@/components/community/ReactionBar";
import { ReportButton } from "@/components/community/ReportButton";
import { useWallet } from "@/lib/hooks/useWallet";
import type { CommunityTarget, ReportTarget } from "@/types/demo";

type CommunitySectionProps = {
  targetType: CommunityTarget;
  targetId: string;
  likes: number;
  dislikes: number;
  reportType?: ReportTarget;
};

export function CommunitySection({
  targetType,
  targetId,
  likes,
  dislikes,
  reportType,
}: CommunitySectionProps) {
  const wallet = useWallet();
  const author = wallet.address;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <ReactionBar
          targetType={targetType}
          targetId={targetId}
          author={author}
          likes={likes}
          dislikes={dislikes}
        />
        <ReportButton
          targetType={reportType ?? (targetType as ReportTarget)}
          targetId={targetId}
          reporter={author}
        />
      </div>
      <CommentThread targetType={targetType} targetId={targetId} author={author} />
    </div>
  );
}
