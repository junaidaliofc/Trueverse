"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { activities, type ActivityItem } from "@/lib/dummy-data";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section";
import { cn, formatRelativeTime } from "@/lib/utils";

const filters = ["All", "Help", "Milestones", "Badges", "Donations"] as const;

export default function ActivityPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const filtered = activities.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Help") return item.type === "help";
    if (filter === "Milestones") return item.type === "milestone";
    if (filter === "Badges") return item.type === "badge";
    if (filter === "Donations") return item.type === "donation";
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Activity"
        title="Community timeline"
        description="Verified moments from people you follow and communities you belong to."
      />

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              filter === item
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((activity, index) => (
          <ActivityCard key={activity.id} activity={activity} index={index} />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity, index }: { activity: ActivityItem; index: number }) {
  const reduceMotion = useReducedMotion();
  const [liked, setLiked] = useState(Boolean(activity.appreciated_by_me));
  const [count, setCount] = useState(activity.appreciations);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass rounded-[1.75rem] p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <Link href={`/u/${activity.actor_trueverse_id}`}>
          <Avatar name={activity.actor_name} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/u/${activity.actor_trueverse_id}`}
              className="font-semibold text-foreground hover:underline"
            >
              {activity.actor_name}
            </Link>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.created_at)}</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground">
            {activity.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.body}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant={liked ? "soft" : "secondary"}
              size="sm"
              onClick={() => {
                setLiked((value) => !value);
                setCount((value) => (liked ? value - 1 : value + 1));
              }}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
              {count}
            </Button>
            <Button variant="secondary" size="sm">
              <MessageCircle className="size-4" />
              {activity.comments}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="size-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
