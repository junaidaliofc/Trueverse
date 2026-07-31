"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import type { StreakState } from "@/lib/xp-engine";
import { describeStreak } from "@/lib/xp-engine";
import { cn } from "@/lib/utils";

export function StreakHero({
  streak,
  className
}: {
  streak: StreakState;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const labels = describeStreak(streak);

  return (
    <motion.div
      className={cn("glass relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="relative flex size-16 items-center justify-center rounded-3xl bg-xp-soft text-xp"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.06, 1],
                  rotate: [0, -3, 3, 0]
                }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <Flame className="size-8 fill-current" />
          {labels.isOnFire ? (
            <motion.span
              className="absolute -right-1 -top-1 size-3 rounded-full bg-xp"
              animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          ) : null}
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-xp">Streak</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            {streak.daily} days
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Show up daily. XP grows. Trust does not.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <StreakStat label="Daily" value={`${streak.daily}d`} />
        <StreakStat label="Weekly" value={`${streak.weekly}w`} />
        <StreakStat label="Monthly" value={`${streak.monthly}m`} />
      </div>
    </motion.div>
  );
}

function StreakStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/55 px-3 py-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-bold text-foreground">{value}</p>
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
