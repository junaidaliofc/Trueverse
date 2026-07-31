"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";
import type { Achievement } from "@/lib/dummy-data";
import { LabeledProgress } from "@/components/ui/progress-field";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

export function AchievementGrid({
  achievements,
  className,
  title = "Achievements"
}: {
  achievements: Achievement[];
  className?: string;
  title?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn(className)}>
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Cosmetic milestones. Never trust.</p>
      </div>

      <motion.ul
        className="grid grid-cols-2 gap-3"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={stagger}
      >
        {achievements.map((item) => (
          <motion.li
            key={item.id}
            variants={fadeUp}
            className={cn(
              "glass rounded-[1.35rem] p-4",
              !item.unlocked && "opacity-70"
            )}
          >
            <div
              className={cn(
                "mb-3 flex size-9 items-center justify-center rounded-2xl",
                item.unlocked ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
              )}
            >
              {item.unlocked ? <Trophy className="size-4" /> : <Lock className="size-4" />}
            </div>
            <p className="text-sm font-semibold leading-5 text-foreground">{item.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
            {!item.unlocked && item.target ? (
              <div className="mt-3">
                <LabeledProgress
                  value={((item.progress ?? 0) / item.target) * 100}
                  indicatorClassName="bg-xp"
                  label={`${item.progress ?? 0}/${item.target}`}
                />
              </div>
            ) : null}
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
