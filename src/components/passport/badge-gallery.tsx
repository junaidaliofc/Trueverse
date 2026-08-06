"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Award, Lock, Sparkles } from "lucide-react";
import type { BadgeDef } from "@/lib/dummy-data";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const accents = [
  "from-teal-500/90 to-emerald-700/90",
  "from-cyan-600/90 to-teal-800/90",
  "from-amber-500/90 to-orange-700/90",
  "from-slate-600/90 to-teal-900/90",
  "from-emerald-500/90 to-teal-700/90"
];

export function PassportBadgeGallery({
  badges,
  className,
  hidden = false
}: {
  badges: BadgeDef[];
  className?: string;
  hidden?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState<BadgeDef | null>(null);
  const earned = badges.filter((b) => b.earned);

  if (hidden) {
    return (
      <section className={cn(className)}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Badges</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Hidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">Badge gallery is private on this Passport.</p>
      </section>
    );
  }

  return (
    <section className={cn(className)}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Badges</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Passport marks
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Cosmetic recognition from verified moments. Badges never raise trust.
          </p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-muted-foreground">
          {earned.length}/{badges.length} unlocked
        </p>
      </div>

      <motion.ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={stagger}
      >
        {badges.map((badge, index) => {
          const accent = accents[index % accents.length];
          return (
            <motion.li key={badge.id} variants={fadeUp}>
              <button
                type="button"
                onClick={() => badge.earned && setSpotlight(badge)}
                disabled={!badge.earned}
                className={cn(
                  "group relative w-full overflow-hidden rounded-[1.5rem] p-4 text-left transition-transform duration-200",
                  badge.earned
                    ? "glass-elevated hover:-translate-y-0.5"
                    : "glass opacity-65"
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-inner",
                    badge.earned ? accent : "from-muted to-muted text-muted-foreground"
                  )}
                >
                  {badge.earned ? (
                    <motion.span
                      initial={reduceMotion ? false : { scale: 0.6, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: index * 0.04 }}
                    >
                      <Award className="size-5" />
                    </motion.span>
                  ) : (
                    <Lock className="size-4" />
                  )}
                </div>
                <p className="text-sm font-semibold leading-5 text-foreground">{badge.name}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
                  {badge.description}
                </p>
                {badge.earned ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                    <Sparkles className="size-3" />
                    Unlocked
                  </span>
                ) : (
                  <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Locked
                  </span>
                )}
              </button>
            </motion.li>
          );
        })}
      </motion.ul>

      <AnimatePresence>
        {spotlight ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSpotlight(null)}
          >
            <motion.div
              role="dialog"
              aria-label={spotlight.name}
              className="w-full max-w-sm overflow-hidden rounded-[1.75rem] bg-surface-elevated p-6 shadow-2xl"
              initial={reduceMotion ? false : { scale: 0.85, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="mx-auto flex size-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-emerald-800 text-white"
                initial={reduceMotion ? false : { rotate: -8, scale: 0.7 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
              >
                <Award className="size-9" />
              </motion.div>
              <h3 className="mt-5 text-center font-display text-2xl font-bold">{spotlight.name}</h3>
              <p className="mt-2 text-center text-sm leading-6 text-muted-foreground">
                {spotlight.description}
              </p>
              {spotlight.earned_at ? (
                <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-brand">
                  Unlocked {spotlight.earned_at}
                </p>
              ) : null}
              <button
                type="button"
                className="mt-6 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
                onClick={() => setSpotlight(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
