"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  TRUST_DIMENSION_META,
  TRUST_DIMENSIONS,
  type ReputationDna,
  type TrustDimension
} from "@/lib/design";
import { cn } from "@/lib/utils";

const DEFAULT_VISIBLE: TrustDimension[] = [
  "helping",
  "reliability",
  "communication",
  "leadership"
];

export function ReputationDnaCard({
  dna,
  title = "Your Reputation DNA",
  dimensions = DEFAULT_VISIBLE,
  className
}: {
  dna: ReputationDna;
  title?: string;
  dimensions?: TrustDimension[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Signals</p>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Trust is earned through verified real-world behavior — never through XP or daily login.
        </p>
      </div>

      <ul className="space-y-4">
        {dimensions.map((key, index) => {
          const meta = TRUST_DIMENSION_META[key];
          const value = Math.max(0, Math.min(100, dna[key] ?? 0));
          return (
            <li key={key}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-foreground">{meta.shortLabel}</span>
                <span className="tabular-nums text-muted-foreground">{value}</span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-label={meta.label}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="h-full rounded-full bg-brand"
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <details className="mt-6 group">
        <summary className="cursor-pointer list-none text-sm font-semibold text-brand">
          How does this person earn trust?
          <span className="ml-2 text-muted-foreground group-open:hidden">Show all</span>
          <span className="ml-2 hidden text-muted-foreground group-open:inline">Hide</span>
        </summary>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {TRUST_DIMENSIONS.map((key) => (
            <li key={key} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
              <p className="font-semibold text-foreground">{TRUST_DIMENSION_META[key].label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {TRUST_DIMENSION_META[key].description}
              </p>
              <p className="mt-2 text-xs font-bold tabular-nums text-brand">{dna[key] ?? 0}/100</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
