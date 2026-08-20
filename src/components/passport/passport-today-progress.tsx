"use client";

import { CheckCircle2, Sparkles, Users } from "lucide-react";
import type { PassportTodayGain } from "@/lib/passport-mock";
import { PASSPORT_EMPTY_STEPS } from "@/lib/passport-mock";
import { PassportGettingStarted } from "@/components/passport/passport-getting-started";
import { cn } from "@/lib/utils";

const GAIN_ICONS = {
  contribution: Sparkles,
  community: Users,
  mission: CheckCircle2
} as const;

export function PassportTodayProgress({
  gains,
  className
}: {
  gains: PassportTodayGain[];
  className?: string;
}) {
  if (gains.length === 0) {
    return <PassportGettingStarted steps={PASSPORT_EMPTY_STEPS} className={className} />;
  }

  return (
    <section className={cn("glass-elevated rounded-[1.75rem] p-5", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
        Today&apos;s progress
      </p>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
        Today&apos;s gains
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Preview deltas. Social activity never changes Trust Score.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {gains.map((gain) => {
          const Icon = GAIN_ICONS[gain.id as keyof typeof GAIN_ICONS] ?? Sparkles;
          return (
            <li
              key={gain.id}
              className="rounded-[1.25rem] bg-muted/40 px-4 py-4 ring-1 ring-border/40"
            >
              <Icon className="size-4 text-primary" />
              {gain.delta ? (
                <p className="mt-2 font-display text-2xl font-bold text-primary">{gain.delta}</p>
              ) : (
                <p className="mt-2 font-display text-lg font-bold text-foreground">Done</p>
              )}
              <p className="mt-1 text-sm font-semibold text-foreground">{gain.label}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
