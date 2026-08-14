"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { CommunityPostView } from "@/lib/types";
import {
  POST_TYPE_META,
  authorHandle,
  authorTrustLevel,
  communityPostPath
} from "@/lib/community";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, cn } from "@/lib/utils";

export function CommunityFeedCard({
  post,
  index = 0,
  className,
  mock = false
}: {
  post: CommunityPostView;
  index?: number;
  viewerId?: string | null;
  className?: string;
  mock?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [appreciated, setAppreciated] = useState(post.appreciated_by_me);
  const [appreciateCount, setAppreciateCount] = useState(post.appreciate_count);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [localComments, setLocalComments] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const meta = POST_TYPE_META[post.post_type];
  const name = post.author?.full_name || "Trueverse Member";
  const handle = authorHandle(post.author);
  const trustLevel = authorTrustLevel(post.author);

  async function share() {
    const url =
      typeof window === "undefined"
        ? communityPostPath(post.id)
        : `${window.location.origin}${communityPostPath(post.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title || name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* cancelled */
    }
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.35 }}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      className={cn(
        "glass-elevated rounded-[1.6rem] p-4 sm:rounded-[1.85rem] sm:p-5",
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
            <p className="font-semibold text-foreground">{name}</p>
            <TrustLevelBadge level={trustLevel} showLabel={false} />
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">@{handle}</p>

          <span
            className={cn(
              "mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              meta.tone
            )}
          >
            {meta.label}
          </span>

          {post.title ? (
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-foreground">
              {post.title}
            </h2>
          ) : null}

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
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
              className={cn("min-h-11", appreciated && "bg-brand-soft text-brand")}
              onClick={() => {
                setAppreciated((value) => !value);
                setAppreciateCount((n) => Math.max(0, n + (appreciated ? -1 : 1)));
              }}
            >
              <Heart className={cn("size-4", appreciated && "fill-current")} />
              Appreciate
              <span className="tabular-nums">{appreciateCount}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="min-h-11"
              aria-expanded={commentsOpen}
              onClick={() => setCommentsOpen((value) => !value)}
            >
              <MessageCircle className="size-4" />
              Comment
              <span className="tabular-nums">
                {post.comment_count + localComments.length}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              onClick={share}
            >
              <Share2 className="size-4" />
              {copied ? "Copied" : "Share"}
            </Button>
          </div>

          {commentsOpen ? (
            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
              {localComments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {mock
                    ? "Comments are local in this preview. Live threads ship with the feed backend."
                    : "No comments yet."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {localComments.map((body, i) => (
                    <li
                      key={`${post.id}-c-${i}`}
                      className="rounded-2xl bg-muted/40 px-3 py-2 text-sm text-foreground"
                    >
                      {body}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder="Write a short reply…"
                  className="h-11 min-w-0 flex-1 rounded-2xl border border-input bg-transparent px-3 text-sm text-foreground placeholder:text-placeholder"
                />
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11"
                  disabled={!commentDraft.trim()}
                  onClick={() => {
                    setLocalComments((prev) => [...prev, commentDraft.trim()]);
                    setCommentDraft("");
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </motion.article>
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
