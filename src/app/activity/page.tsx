"use client";

import { useMemo, useState } from "react";
import { activities, followingIds } from "@/lib/dummy-data";
import { ActivityFeedCard } from "@/components/social/activity-feed-card";
import { MotionItem, MotionPage } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const filters = ["Following", "All", "Help", "Milestones", "Badges"] as const;

export default function ActivityPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Following");

  const filtered = useMemo(() => {
    return activities.filter((item) => {
      if (filter === "Following") return followingIds.includes(item.actor_id);
      if (filter === "All") return true;
      if (filter === "Help") return item.type === "help";
      if (filter === "Milestones") return item.type === "milestone";
      if (filter === "Badges") return item.type === "badge";
      return true;
    });
  }, [filter]);

  return (
    <MotionPage className="mx-auto max-w-lg space-y-6">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verified moments from people you follow. Appreciate and comment — never a trust scoreboard.
        </p>
      </MotionItem>

      <MotionItem className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              filter === item
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </MotionItem>

      <div className="space-y-4">
        {filtered.map((activity, index) => (
          <ActivityFeedCard
            key={activity.id}
            activity={activity}
            index={index}
            showFollow={filter !== "Following"}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <MotionItem className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No activity yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Follow people in Community to fill this timeline.
          </p>
        </MotionItem>
      ) : null}
    </MotionPage>
  );
}
