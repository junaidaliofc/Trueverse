"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, Share2 } from "lucide-react";
import type { ActivityItem } from "@/lib/dummy-data";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { AppreciateButton } from "@/components/social/appreciate-button";
import { FollowButton } from "@/components/social/follow-button";
import { CommentThread } from "@/components/social/comment-thread";
import { formatRelativeTime, cn } from "@/lib/utils";
import { followingIds } from "@/lib/dummy-data";

export function ActivityFeedCard({
  activity,
  index = 0,
  showFollow = true
}: {
  activity: ActivityItem;
  index?: number;
  showFollow?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [openComments, setOpenComments] = useState(false);
  const initiallyFollowing = followingIds.includes(activity.actor_id);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      className="glass rounded-[1.75rem] p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Link href={`/u/${activity.actor_trueverse_id.replace(/^tv_/, "")}`}>
          <UserAvatar name={activity.actor_name} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/u/${activity.actor_trueverse_id.replace(/^tv_/, "")}`}
                className="font-semibold text-foreground hover:underline"
              >
                {activity.actor_name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.created_at)}
              </span>
            </div>
            {showFollow ? (
              <FollowButton
                trueverseId={activity.actor_trueverse_id}
                initialFollowing={initiallyFollowing}
              />
            ) : null}
          </div>

          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
            {activity.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.body}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <AppreciateButton
              activityId={activity.id}
              initialCount={activity.appreciations}
              initialAppreciated={activity.appreciated_by_me}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpenComments((value) => !value)}
              aria-expanded={openComments}
            >
              <MessageCircle className="size-4" />
              <span className="tabular-nums">{activity.comments}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                const url = `${window.location.origin}/activity`;
                if (navigator.share) {
                  await navigator.share({ title: activity.title, text: activity.body, url });
                } else if (navigator.clipboard) {
                  await navigator.clipboard.writeText(url);
                }
              }}
            >
              <Share2 className="size-4" />
              Share
            </Button>
          </div>

          <div className={cn(!openComments && "hidden")}>
            <CommentThread
              activityId={activity.id}
              initialComments={activity.comment_items ?? []}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
