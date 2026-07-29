"use client";

import { Flame } from "lucide-react";
import { xpToLevel } from "@/lib/design";
import { LabeledProgress } from "@/components/ui/progress-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export function XPProgress({
  totalXp,
  className,
  compact = false
}: {
  totalXp: number;
  className?: string;
  compact?: boolean;
}) {
  const { level, progress, nextFloor, totalXp: xp } = xpToLevel(totalXp);

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

export function StreakPill({ streak, className }: { streak: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl bg-xp-soft px-3 py-2 text-sm font-semibold text-xp ring-1 ring-xp/15",
        className
      )}
    >
      <Flame className="size-4 fill-current" aria-hidden />
      <span>{streak}-day streak</span>
    </div>
  );
}
