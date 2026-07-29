"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import {
  currentUser,
  currentUserReputation,
  missions,
  userXp
} from "@/lib/dummy-data";
import { getGreeting } from "@/lib/utils";
import { scoreToTrustLevel, TRUST_LEVEL_META } from "@/lib/design";
import { TrustStars } from "@/components/trust/trust-reputation-card";
import { XPProgress, StreakPill } from "@/components/xp/xp-progress";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { LabeledProgress } from "@/components/ui/progress-field";
import { MotionCard, MotionItem, MotionPage, fadeUp, stagger } from "@/components/motion/primitives";

/**
 * Phase 1 Home — consumer composition, not a dashboard.
 * Above the fold: greeting, trust level, XP, streak, today's missions.
 */
export default function HomePage() {
  const firstName = currentUser.full_name.split(" ")[0] ?? "there";
  const todayMissions = missions.filter((mission) => mission.cadence === "daily");
  const level = scoreToTrustLevel(currentUserReputation.trustIndex);
  const meta = TRUST_LEVEL_META[level];
  const reduceMotion = useReducedMotion();
  const nextMission = todayMissions.find((mission) => !mission.completed) ?? todayMissions[0];

  return (
    <MotionPage className="mx-auto max-w-lg space-y-5 sm:space-y-6">
      <MotionItem className="pt-1">
        <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {firstName}
        </h1>
      </MotionItem>

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Trust level</p>
            <p className="mt-2 font-display text-3xl font-bold tracking-tight">{meta.label}</p>
            <div className="mt-3">
              <TrustStars stars={meta.stars} />
            </div>
            {currentUserReputation.identityVerified ? (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
                <BadgeCheck className="size-4" aria-hidden />
                Verified Identity
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Verify identity to strengthen signals</p>
            )}
          </div>
          <StreakPill streak={userXp.daily_streak} />
        </div>
      </MotionCard>

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
        <XPProgress totalXp={userXp.total_xp} />
      </MotionCard>

      <MotionItem>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Today&apos;s missions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Small steps. Real momentum.</p>
          </div>
          <Link href="/missions" className="text-sm font-semibold text-primary">
            All
          </Link>
        </div>

        <motion.ul
          className="space-y-3"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={stagger}
        >
          {todayMissions.map((mission, index) => (
            <motion.li
              key={mission.id}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              className="glass rounded-[1.5rem] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {mission.completed ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-success-soft text-success">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                    <p className="font-semibold text-foreground">{mission.title}</p>
                  </div>
                  <p className="mt-2 pl-8 text-xs leading-5 text-muted-foreground">
                    {mission.description}
                  </p>
                </div>
                <StatusBadge tone={mission.completed ? "success" : "xp"}>
                  +{mission.xp_reward}
                </StatusBadge>
              </div>
              <div className="mt-3 pl-8">
                <LabeledProgress
                  value={(mission.progress / mission.target) * 100}
                  indicatorClassName="bg-xp"
                />
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </MotionItem>

      {nextMission && !nextMission.completed ? (
        <MotionItem>
          <Button asChild size="lg" className="w-full">
            <Link href="/missions">
              Continue · {nextMission.title}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </MotionItem>
      ) : (
        <MotionItem>
          <div className="glass rounded-[1.5rem] px-5 py-8 text-center">
            <p className="font-display text-lg font-bold">You&apos;re on a roll</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Come back tomorrow — or explore your community.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <Link href="/community">Explore community</Link>
            </Button>
          </div>
        </MotionItem>
      )}
    </MotionPage>
  );
}
