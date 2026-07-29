"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { TRUST_LEVEL_META, scoreToTrustLevel, type TrustLevel } from "@/lib/design";
import { cn } from "@/lib/utils";

export type TrustReputationStats = {
  trustIndex: number;
  level?: TrustLevel;
  identityVerified?: boolean;
  trustActs: number;
  appreciations: number;
  communityRank?: string;
};

export function TrustStars({ stars, className }: { stars: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`${stars} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < stars;
        return (
          <Star
            key={index}
            className={cn("size-4", filled ? "fill-brand text-brand" : "text-muted-foreground/35")}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export function TrustReputationCard({
  stats,
  className,
  compact = false
}: {
  stats: TrustReputationStats;
  className?: string;
  compact?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const level = stats.level ?? scoreToTrustLevel(stats.trustIndex);
  const meta = TRUST_LEVEL_META[level];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass overflow-hidden rounded-[1.75rem] p-6 sm:p-7", className)}
    >
      <div className={cn("flex flex-col gap-6", compact ? "" : "sm:flex-row sm:items-end sm:justify-between")}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Trust level</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {meta.label}
          </h2>
          <div className="mt-3">
            <TrustStars stars={meta.stars} />
          </div>
          {stats.identityVerified ? (
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-success">
              <BadgeCheck className="size-4" aria-hidden />
              Verified Identity
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Identity not verified yet</p>
          )}
        </div>

        <dl className="grid grid-cols-3 gap-3 sm:min-w-[18rem]">
          <Stat label="Trust Acts" value={stats.trustActs.toLocaleString()} />
          <Stat label="Appreciations" value={stats.appreciations.toLocaleString()} />
          <Stat label="Community Rank" value={stats.communityRank ?? "—"} />
        </dl>
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-3 py-3 text-center ring-1 ring-border/60">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg font-bold text-foreground sm:text-xl">{value}</dd>
    </div>
  );
}
