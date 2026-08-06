"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { Mission } from "@/lib/dummy-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { LabeledProgress } from "@/components/ui/progress-field";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

export function DailyMissions({
  missions,
  className,
  showContinue = true
}: {
  missions: Mission[];
  className?: string;
  showContinue?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const daily = missions.filter((mission) => mission.cadence === "daily").slice(0, 3);
  const next = daily.find((mission) => !mission.completed) ?? daily[0];
  const completedCount = daily.filter((mission) => mission.completed).length;

  return (
    <section className={cn(className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight">Today&apos;s missions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedCount}/{daily.length} complete · XP only, never trust
          </p>
        </div>
      </div>

      <motion.ul
        className="space-y-3"
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        variants={stagger}
      >
        {daily.map((mission, index) => (
          <motion.li
            key={mission.id}
            variants={fadeUp}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          >
            <MissionCard mission={mission} index={index} />
          </motion.li>
        ))}
      </motion.ul>

      {showContinue && next ? (
        <div className="mt-4">
          {next.completed ? (
            <div className="glass rounded-[1.5rem] px-5 py-7 text-center">
              <p className="font-display text-lg font-bold">Daily missions cleared</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Come back tomorrow — or keep exploring the community.
              </p>
              <Button asChild variant="secondary" className="mt-5">
                <Link href="/community">Explore community</Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href={next.href ?? "/missions"}>
                Continue · {next.title}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : null}
    </section>
  );
}

export function MissionCard({ mission, index }: { mission: Mission; index?: number }) {
  return (
    <div className="glass rounded-[1.5rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {mission.completed ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-success-soft text-success">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {(index ?? 0) + 1}
              </span>
            )}
            <p className="font-semibold text-foreground">{mission.title}</p>
          </div>
          <p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">{mission.description}</p>
        </div>
        <StatusBadge tone={mission.completed ? "success" : "xp"}>+{mission.xp_reward}</StatusBadge>
      </div>
      <div className="mt-3 pl-8">
        <LabeledProgress
          value={(mission.progress / mission.target) * 100}
          indicatorClassName="bg-xp"
        />
      </div>
    </div>
  );
}
