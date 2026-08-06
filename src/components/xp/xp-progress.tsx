"use client";

import { xpToLevel } from "@/lib/xp-engine";
import { LabeledProgress } from "@/components/ui/progress-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export { StreakPill } from "@/components/xp/streak-hero";

export function XPProgress({
  totalXp,
  className,
  compact = false
}: {
  totalXp: number;
  className?: string;
  compact?: boolean;
}) {
  const { level, progress, nextFloor, totalXp: xp, xpToNext } = xpToLevel(totalXp);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <StatusBadge tone="xp">XP Lv {level}</StatusBadge>
        <div className="min-w-24 flex-1">
          <LabeledProgress value={progress * 100} indicatorClassName="bg-xp" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-xp">Experience</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">Level {level}</p>
          <p className="mt-1 text-sm text-muted-foreground">{xpToNext.toLocaleString()} XP to next level</p>
        </div>
        <StatusBadge tone="xp">{xp.toLocaleString()} XP</StatusBadge>
      </div>
      <LabeledProgress
        value={progress * 100}
        indicatorClassName="bg-xp"
        label={`Next level at ${nextFloor.toLocaleString()} XP`}
      />
      <p className="text-xs leading-5 text-muted-foreground">
        XP unlocks cosmetics, badges, themes, and achievements. XP never increases trust.
      </p>
    </div>
  );
}
