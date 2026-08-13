"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Flag, MessageCircle } from "lucide-react";
import type { CommunityCommentView, CommunityPostView } from "@/lib/types";
import {
  POST_TYPE_META,
  authorHandle,
  authorTrustLevel,
  communityPostPath
} from "@/lib/community";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Button } from "@/components/ui/button";
import { ReactionBar } from "@/components/community/reaction-bar";
import { BookmarkButton } from "@/components/community/bookmark-button";
import { SharePostButton } from "@/components/community/share-button";
import { CommentsPanel } from "@/components/community/comments-panel";
import { formatRelativeTime, cn } from "@/lib/utils";

export function CommunityFeedCard({
  post,
  index = 0,
  viewerId,
  className
}: {
  post: CommunityPostView;
  index?: number;
  viewerId?: string | null;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [comments, setComments] = useState<CommunityCommentView[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [, startTransition] = useTransition();
  const meta = POST_TYPE_META[post.post_type];
  const name = post.author?.full_name || "Trueverse Member";
  const handle = authorHandle(post.author);
  const trustLevel = authorTrustLevel(post.author);

  function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && !commentsLoaded) {
      setCommentsLoading(true);
      startTransition(async () => {
        const response = await fetch(`/api/community/posts/${post.id}/comments`);
        const payload = await response.json().catch(() => ({}));
        setComments(payload.comments ?? []);
        setCommentsLoaded(true);
        setCommentsLoading(false);
      });
    }
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.35 }}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      className={cn("glass rounded-[1.6rem] p-4 sm:rounded-[1.75rem] sm:p-5", className)}
      data-feed-kind="organic"
    >
      <div className="flex items-start gap-3">
        <Link href={`/u/${handle}`} className="shrink-0">
          <UserAvatar name={name} src={post.author?.photo_url} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/u/${handle}`}
              className="font-semibold text-foreground hover:underline"
            >
              {name}
            </Link>
            <span className="text-sm text-muted-foreground">@{handle}</span>
            <TrustLevelBadge level={trustLevel} showLabel={false} />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                meta.tone
              )}
            >
              {meta.label}
            </span>
            {post.trust_act_id ? (
              <Link
                href={`/interactions/${post.trust_act_id}`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Linked Trust Act
              </Link>
            ) : null}
          </div>

          {post.title ? (
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground">
              <Link href={communityPostPath(post.id)} className="hover:underline">
                {post.title}
              </Link>
            </h2>
          ) : null}

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {post.body}
          </p>

          {post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt=""
              className="mt-3 max-h-80 w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <ReactionBar
              postId={post.id}
              likeCount={post.like_count}
              appreciateCount={post.appreciate_count}
              likedByMe={post.liked_by_me}
              appreciatedByMe={post.appreciated_by_me}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="min-h-10"
              aria-expanded={commentsOpen}
              onClick={toggleComments}
            >
              <MessageCircle className="size-4" />
              <span className="tabular-nums">{commentCount}</span>
              <span className="sr-only sm:not-sr-only">Comment</span>
            </Button>
            <SharePostButton postId={post.id} title={post.title} />
            <BookmarkButton
              postId={post.id}
              initialBookmarked={post.bookmarked_by_me}
            />
            <Button asChild variant="ghost" size="sm" className="min-h-10">
              <Link href={`/interactions/create?report=${handle}`}>
                <Flag className="size-4" />
                <span className="sr-only sm:not-sr-only">Report</span>
              </Link>
            </Button>
          </div>

          <CommentsPanel
            postId={post.id}
            open={commentsOpen}
            viewerId={viewerId}
            comments={comments}
            loading={commentsLoading}
            onCommentsChange={setComments}
            onCountChange={(delta) =>
              setCommentCount((n) => Math.max(0, n + delta))
            }
          />
        </div>
      </div>
    </motion.article>
  );
}

/** Reserved sponsored slot — not rendered until ads ship with clear labeling. */
export function SponsoredFeedSlot({ id }: { id: string }) {
  return (
    <div
      data-feed-kind="sponsored"
      data-sponsored-slot={id}
      data-enabled="false"
      hidden
      aria-hidden
    />
  );
}
