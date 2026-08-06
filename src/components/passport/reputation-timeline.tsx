"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  HandHeart,
  Sparkles,
  Target,
  Trophy,
  Users
} from "lucide-react";
import type { PassportReputationEvent, PassportReputationEventKind } from "@/lib/passport";
import { formatRelativeTime } from "@/lib/utils";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const meta: Record<
  PassportReputationEventKind,
  { label: string; icon: typeof HandHeart; tone: string }
> = {
  trust_act: {
    label: "Trust Act",
    icon: HandHeart,
    tone: "bg-brand-soft text-brand"
  },
  achievement: {
    label: "Achievement",
    icon: Trophy,
    tone: "bg-xp-soft text-xp"
  },
  verification: {
    label: "Verification",
    icon: BadgeCheck,
    tone: "bg-success-soft text-success"
  },
  contribution: {
    label: "Contribution",
    icon: Users,
    tone: "bg-danger-soft text-danger"
  },
  mission: {
    label: "Mission",
    icon: Target,
    tone: "bg-muted text-foreground"
  }
};

export function PassportReputationTimeline({
  events,
  className,
  hidden = false
}: {
  events: PassportReputationEvent[];
  className?: string;
  hidden?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (hidden) {
    return (
      <section className={cn(className)}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Timeline</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Hidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reputation timeline is private on this Passport.
        </p>
      </section>
    );
  }

  return (
    <section className={cn(className)}>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">
          Reputation timeline
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
          The living record
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Trust Acts, achievements, verifications, contributions, and missions — in one story.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <Sparkles className="mx-auto size-6 text-brand" />
          <p className="mt-3 font-display text-lg font-bold">No public moments yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified activity will appear here as the Passport grows.
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
            const kind = meta[event.kind];
            const Icon = kind.icon;
            return (
              <motion.li key={event.id} variants={fadeUp} className="relative pl-12">
                <span
                  className={cn(
                    "absolute left-2 top-4 flex size-9 items-center justify-center rounded-2xl",
                    kind.tone
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <article className="glass rounded-[1.5rem] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      {event.meta ?? kind.label}
                    </span>
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
