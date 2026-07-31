"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import { getUnlocksForProgress, xpToLevel, type XpUnlock } from "@/lib/xp-engine";
import { LabeledProgress } from "@/components/ui/progress-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export function XPJourney({
  totalXp,
  unlocks,
  className
}: {
  totalXp: number;
  unlocks: XpUnlock[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { level, progress, nextFloor, xpToNext, totalXp: xp } = xpToLevel(totalXp);
  const { next, upcomingBadge } = getUnlocksForProgress(totalXp, unlocks);

  return (
    <motion.section
      className={cn("glass rounded-[1.75rem] p-5 sm:p-6", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-xp">Experience</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight">Level {level}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {xpToNext.toLocaleString()} XP to Level {level + 1}
          </p>
        </div>
        <StatusBadge tone="xp">{xp.toLocaleString()} XP</StatusBadge>
      </div>

      <div className="mt-5">
        <LabeledProgress
          value={progress * 100}
          indicatorClassName="bg-xp"
          label={`Next level at ${nextFloor.toLocaleString()} XP`}
        />
      </div>

      <div className="mt-5 grid gap-3">
        <UnlockRow
          icon={<Sparkles className="size-4" />}
          label="Next unlock"
          value={next ? next.title : "All caught up"}
          detail={next?.description}
        />
        <UnlockRow
          icon={<Gift className="size-4" />}
          label="Upcoming badge"
          value={upcomingBadge ? upcomingBadge.title : "None queued"}
          detail={
            upcomingBadge
              ? `Unlocks at Level ${upcomingBadge.requiredLevel}`
              : "Keep completing missions"
          }
        />
      </div>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        XP unlocks levels, badges, themes, decorations, and animations. XP never increases trust.
      </p>
    </motion.section>
  );
}

function UnlockRow({
  icon,
  label,
  value,
  detail
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/50 px-3.5 py-3">
      <span className="mt-0.5 text-xp">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-semibold text-foreground">{value}</p>
        {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}
