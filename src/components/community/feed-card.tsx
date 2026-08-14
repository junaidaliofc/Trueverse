"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Handshake, MapPin } from "lucide-react";
import type { CommunityAuthor, CommunityCommentView, CommunityPostView } from "@/lib/types";
import { POST_TYPE_META, authorHandle, authorTrustLevel, communityPostPath } from "@/lib/community";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Button } from "@/components/ui/button";
import { CommentsPanel } from "@/components/community/comments-panel";
import { SharePostButton } from "@/components/community/share-button";
import { formatRelativeTime, cn } from "@/lib/utils";

export function CommunityFeedCard({
  post,
  viewerId,
  viewer,
  className,
  mock = false
}: {
  post: CommunityPostView;
  index?: number;
  viewerId?: string | null;
  viewer?: CommunityAuthor | null;
  className?: string;
  mock?: boolean;
}) {
  const [appreciated, setAppreciated] = useState(post.appreciated_by_me);
  const [appreciateCount, setAppreciateCount] = useState(post.appreciate_count);
  const [commentCount, setCommentCount] = useState(post.comment_count);
  const [comments, setComments] = useState<CommunityCommentView[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(!mock);
  const [pending, startTransition] = useTransition();
  const meta = POST_TYPE_META[post.post_type];
  const name = post.author?.full_name || "Trueverse Member";
  const handle = authorHandle(post.author);
  const trustLevel = authorTrustLevel(post.author);

  useEffect(() => {
    if (mock) return;
    let cancelled = false;
    fetch(`/api/community/posts/${post.id}/comments`)
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setComments(payload.comments ?? []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [post.id, mock]);

  function toggleAppreciate() {
    if (mock) {
      setAppreciated((value) => !value);
      setAppreciateCount((n) => Math.max(0, n + (appreciated ? -1 : 1)));
      return;
    }

    startTransition(async () => {
      const wasActive = appreciated;
      setAppreciated(!wasActive);
      setAppreciateCount((n) => Math.max(0, n + (wasActive ? -1 : 1)));
      const response = await fetch(`/api/community/posts/${post.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: "appreciate" })
      });
      if (!response.ok) {
        setAppreciated(wasActive);
        setAppreciateCount((n) => Math.max(0, n + (wasActive ? 1 : -1)));
      }
    });
  }

  return (
    <article
      className={cn(
        "glass-elevated rounded-[1.6rem] p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:rounded-[1.85rem] sm:p-5",
        className
      )}
      data-feed-kind="organic"
    >
      <div className="flex items-start gap-3">
        <Link href={mock ? "#" : `/u/${handle}`} className="shrink-0">
          <UserAvatar name={name} src={post.author?.photo_url} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={mock ? "#" : `/u/${handle}`}
              className="font-semibold text-foreground hover:text-primary"
            >
              {name}
            </Link>
            <TrustLevelBadge level={trustLevel} showLabel={false} />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">@{handle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                meta.tone
              )}
            >
              {meta.label}
            </span>
            {post.category ? (
              <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {post.category}
              </span>
            ) : null}
            {post.location ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {post.location}
              </span>
            ) : null}
          </div>

          {post.title ? (
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground">
              <Link href={communityPostPath(post.id)} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
          ) : null}

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground sm:text-[15px]">
            {post.body}
          </p>

          {post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt=""
              className="mt-3 max-h-72 w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              aria-pressed={appreciated}
              title="Social appreciation only — does not change trust"
              className={cn("min-h-11", appreciated && "bg-brand-soft text-brand")}
              onClick={toggleAppreciate}
            >
              <Handshake className="size-4" />
              Appreciate
              <span className="tabular-nums">{appreciateCount}</span>
            </Button>
            <SharePostButton postId={post.id} title={post.title} />
          </div>

          <CommentsPanel
            postId={post.id}
            viewerId={viewerId}
            viewer={viewer}
            comments={comments}
            loading={commentsLoading}
            onCommentsChange={setComments}
            onCountChange={(delta) => setCommentCount((n) => Math.max(0, n + delta))}
            local={mock}
          />
          <p className="sr-only">{commentCount} comments</p>
        </div>
      </div>
    </article>
  );
}

export function SponsoredFeedCard({
  advertiser,
  title,
  body
}: {
  id?: string;
  advertiser: string;
  title: string;
  body: string;
}) {
  return (
    <article
      data-feed-kind="sponsored"
      className="rounded-[1.85rem] border border-dashed border-warning/50 bg-warning-soft/40 p-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-warning">
        Sponsored
      </p>
      <p className="mt-2 text-xs font-semibold text-muted-foreground">{advertiser}</p>
      <h2 className="mt-1 font-display text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

/** @deprecated Use SponsoredFeedCard. Kept as an architecture alias. */
export function SponsoredFeedSlot({
  id,
  advertiser,
  title,
  body
}: {
  id: string;
  advertiser?: string;
  title?: string;
  body?: string;
}) {
  return (
    <SponsoredFeedCard
      id={id}
      advertiser={advertiser ?? "Trueverse"}
      title={title ?? "Sponsored"}
      body={body ?? "Labeled sponsored placement."}
    />
  );
}
