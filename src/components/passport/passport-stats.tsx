"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  HandHeart,
  Heart,
  MessagesSquare,
  Target,
  Users
} from "lucide-react";
import type { PassportStats } from "@/lib/design";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const STATS: {
  key: keyof PassportStats;
  label: string;
  icon: typeof HandHeart;
  format?: (n: number) => string;
}[] = [
  { key: "trustActs", label: "Verified Trust Acts", icon: HandHeart },
  { key: "uniqueContributors", label: "Unique Contributors", icon: Users },
  { key: "references", label: "References", icon: MessagesSquare },
  {
    key: "yearsActive",
    label: "Years Active",
    icon: CalendarDays,
    format: (n) => (n < 1 ? `${Math.round(n * 12)} mo` : n.toFixed(n % 1 === 0 ? 0 : 1))
  },
  { key: "appreciationsReceived", label: "Appreciations Received", icon: Heart },
  { key: "missionsCompleted", label: "Missions Completed", icon: Target }
];

export function PassportStatistics({
  stats,
  className,
  hidden = false
}: {
  stats: PassportStats;
  className?: string;
  hidden?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (hidden) {
    return (
      <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Statistics</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Hidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Detailed statistics are private on this Passport.
        </p>
      </section>
    );
  }

  return (
    <section className={cn(className)}>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Statistics</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Verified footprint
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Counts from real interactions — never inflated by XP or daily login.
        </p>
      </div>

      <motion.ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={stagger}
      >
        {STATS.map((item) => {
          const Icon = item.icon;
          const raw = stats[item.key];
          const value = item.format ? item.format(raw) : raw.toLocaleString();
          return (
            <motion.li
              key={item.key}
              variants={fadeUp}
              className="glass rounded-[1.4rem] p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-4" />
              </span>
              <p className="mt-3 font-display text-2xl font-bold tabular-nums tracking-tight">
                {value}
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                {item.label}
              </p>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
