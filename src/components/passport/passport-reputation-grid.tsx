"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Clock3,
  HeartHandshake,
  Shield,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import type { ReputationSnapshot } from "@/lib/reputation";
import { PASSPORT_EMPTY_STEPS, REPUTATION_CARD_META } from "@/lib/passport-mock";
import { LabeledProgress } from "@/components/ui/progress-field";
import { PassportGettingStarted } from "@/components/passport/passport-getting-started";
import { cn } from "@/lib/utils";

const ICONS = {
  shield: Shield,
  heart: HeartHandshake,
  spark: Sparkles,
  clock: Clock3,
  users: Users,
  star: Star,
  alert: AlertTriangle
};

export function PassportReputationGrid({
  snapshot,
  className
}: {
  snapshot: ReputationSnapshot;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const isEmpty = snapshot.dimensions.every((dimension) => dimension.value <= 0);

  if (isEmpty) {
    return <PassportGettingStarted steps={PASSPORT_EMPTY_STEPS} className={className} />;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Reputation scores
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Seven signals
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Presentation preview. Trust never rises from likes, XP, or daily login.
          </p>
        </div>
        <div className="rounded-[1.15rem] bg-muted/40 px-4 py-2.5 ring-1 ring-border/40">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            Composite
          </p>
          <p className="font-display text-xl font-bold tabular-nums text-foreground">
            {snapshot.overall}
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {snapshot.dimensions.map((dimension, index) => {
          const meta = REPUTATION_CARD_META[dimension.id];
          const Icon = ICONS[meta.icon];
          return (
            <motion.li
              key={dimension.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="glass-elevated rounded-[1.5rem] p-4 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <Icon className="size-4" />
                </span>
                <p className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {dimension.value}
                </p>
              </div>
              <p className="mt-3 font-semibold text-foreground">{dimension.label}</p>
              <div className="mt-3">
                <LabeledProgress value={dimension.value} indicatorClassName={meta.bar} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {dimension.explanation}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
