"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReputationSnapshot } from "@/lib/reputation";
import { LabeledProgress } from "@/components/ui/progress-field";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  identity: "bg-primary",
  trust: "bg-brand",
  contribution: "bg-success",
  expertise: "bg-xp",
  community: "bg-chart-2",
  reliability: "bg-chart-4",
  safety: "bg-warning"
};

export function ReputationDashboard({
  snapshot,
  className
}: {
  snapshot: ReputationSnapshot;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("glass-elevated rounded-[1.85rem] p-5 sm:p-6", className)}>
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Reputation
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          Your reputation engine
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Seven signals, kept separate from likes. Trust never rises from XP.
        </p>
      </div>

      <div className="mb-5 rounded-[1.35rem] bg-muted/40 px-4 py-3 ring-1 ring-border/50">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Composite
        </p>
        <p className="mt-1 font-display text-3xl font-bold tabular-nums text-foreground">
          {snapshot.overall}
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {snapshot.dimensions.map((dimension, index) => (
          <motion.li
            key={dimension.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="rounded-[1.35rem] bg-muted/35 p-4 ring-1 ring-border/40"
          >
            <div className="flex items-end justify-between gap-3">
              <p className="font-semibold text-foreground">{dimension.label}</p>
              <p className="font-display text-2xl font-bold tabular-nums text-foreground">
                {dimension.value}
              </p>
            </div>
            <div className="mt-3">
              <LabeledProgress
                value={dimension.value}
                indicatorClassName={TONE[dimension.id] ?? "bg-primary"}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {dimension.explanation}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
