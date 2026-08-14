"use client";

import {
  Flag,
  HandHeart,
  Heart,
  Mail,
  TrendingUp,
  UserRound
} from "lucide-react";
import type { PassportTimelineCard } from "@/lib/passport-mock";
import { PASSPORT_EMPTY_STEPS } from "@/lib/passport-mock";
import { PassportGettingStarted } from "@/components/passport/passport-getting-started";
import { cn } from "@/lib/utils";

const EVENT_ICONS = {
  joined: Flag,
  email: Mail,
  profile: UserRound,
  appreciation: Heart,
  volunteered: HandHeart,
  "level-up": TrendingUp
} as const;

export function PassportStoryTimeline({
  events,
  className
}: {
  events: PassportTimelineCard[];
  className?: string;
}) {
  if (events.length === 0) {
    return <PassportGettingStarted steps={PASSPORT_EMPTY_STEPS} className={className} />;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Reputation timeline
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          Your story
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Mock milestones for Passport 2.0. Live events replace these later.
        </p>
      </div>

      <ol className="relative space-y-3 pl-2">
        <div aria-hidden className="absolute bottom-3 left-[1.35rem] top-3 w-px bg-border" />
        {events.map((event) => {
          const Icon = EVENT_ICONS[event.id as keyof typeof EVENT_ICONS] ?? Flag;
          return (
            <li
              key={event.id}
              className="relative pl-12"
            >
              <span className="absolute left-0.5 top-5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                <Icon className="size-3" />
              </span>
              <article className="glass-elevated rounded-[1.4rem] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    {event.when}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{event.body}</p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
