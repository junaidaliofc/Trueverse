"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Flame,
  Heart,
  HandHeart,
  Sparkles,
  Target
} from "lucide-react";
import type { TimelineEvent } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const iconMap = {
  help: HandHeart,
  appreciation: Heart,
  badge: Award,
  streak: Flame,
  identity: BadgeCheck,
  mission: Target,
  xp: Sparkles
} as const;

const toneMap = {
  help: "bg-brand-soft text-brand",
  appreciation: "bg-danger-soft text-danger",
  badge: "bg-success-soft text-success",
  streak: "bg-xp-soft text-xp",
  identity: "bg-brand-soft text-brand",
  mission: "bg-muted text-foreground",
  xp: "bg-xp-soft text-xp"
} as const;

export function ActivityTimeline({
  events,
  className,
  title = "Activity"
}: {
  events: TimelineEvent[];
  className?: string;
  title?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn(className)}>
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A living record of verified moments and XP milestones.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">Your story starts here</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Help someone, earn a badge, or complete a mission — it will appear here.
          </p>
        </div>
      ) : (
        <motion.ol
          className="relative space-y-3"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={stagger}
        >
          <div
            aria-hidden
            className="absolute bottom-4 left-[1.6rem] top-4 w-px bg-border"
          />
          {events.map((event) => {
            const Icon = iconMap[event.type];
            return (
              <motion.li key={event.id} variants={fadeUp} className="relative pl-12">
                <span
                  className={cn(
                    "absolute left-2 top-4 flex size-9 items-center justify-center rounded-2xl",
                    toneMap[event.type]
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <article className="glass rounded-[1.5rem] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    {event.meta ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {event.meta}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{event.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(event.created_at)}
                    {event.actor_name ? ` · ${event.actor_name}` : ""}
                  </p>
                </article>
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </section>
  );
}
