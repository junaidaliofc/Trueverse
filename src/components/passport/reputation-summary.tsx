"use client";

import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/design";
import type { PassportStats } from "@/lib/design";
import { TrustStars } from "@/components/trust/trust-reputation-card";
import { LabeledProgress } from "@/components/ui/progress-field";
import { cn } from "@/lib/utils";

export function PassportReputationSummary({
  trustLevel,
  trustIndex,
  stats,
  memberSince,
  className
}: {
  trustLevel: TrustLevel;
  trustIndex: number;
  stats: PassportStats;
  memberSince: string;
  className?: string;
}) {
  const meta = TRUST_LEVEL_META[trustLevel];
  const bandSpan = meta.max - meta.min + 1;
  const progressInBand = Math.max(
    0,
    Math.min(100, ((trustIndex - meta.min) / Math.max(1, bandSpan)) * 100)
  );

  return (
    <section className={cn("glass rounded-[1.75rem] p-5 sm:p-7", className)}>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          Reputation summary
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
          Trust signals
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trust and XP stay separate. XP never increases trust.
        </p>
      </div>

      <div className="rounded-[1.35rem] bg-muted/45 p-4 ring-1 ring-border/40">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Trust level
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{meta.label}</p>
            <div className="mt-2">
              <TrustStars stars={meta.stars} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>
        <div className="mt-4">
          <LabeledProgress value={progressInBand} label="Progress in level" />
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Positive Trust Acts", stats.trustActs],
          ["Accepted contributions", stats.uniqueContributors],
          ["Community activity", stats.missionsCompleted],
          ["Appreciations", stats.appreciationsReceived],
          ["Years active", stats.yearsActive]
        ].map(([label, value]) => (
          <li key={String(label)} className="rounded-[1.25rem] bg-muted/40 px-4 py-3 ring-1 ring-border/40">
            <p className="font-display text-xl font-bold tabular-nums text-foreground">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
