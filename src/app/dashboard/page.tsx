"use client";

import {
  achievements,
  currentUser,
  currentUserReputation,
  dailyMissions,
  userStreaks,
  userXp,
  xpUnlockCatalog
} from "@/lib/dummy-data";
import { getGreeting } from "@/lib/utils";
import { scoreToTrustLevel, TRUST_LEVEL_META } from "@/lib/design";
import { TrustStars } from "@/components/trust/trust-reputation-card";
import { StreakHero } from "@/components/xp/streak-hero";
import { XPJourney } from "@/components/xp/xp-journey";
import { DailyMissions } from "@/components/missions/daily-missions";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";
import { BadgeCheck } from "lucide-react";

/**
 * Phase 2 Home — daily habit loop.
 * Trust card stays independent from XP / streaks / missions.
 */
export default function HomePage() {
  const firstName = currentUser.full_name.split(" ")[0] ?? "there";
  const level = scoreToTrustLevel(currentUserReputation.trustIndex);
  const meta = TRUST_LEVEL_META[level];

  return (
    <MotionPage className="mx-auto max-w-lg space-y-5 sm:space-y-6">
      <MotionItem className="pt-1">
        <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {firstName}
        </h1>
      </MotionItem>

      <StreakHero streak={userStreaks} />

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
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
          <p className="mt-3 text-xs text-muted-foreground">
            Trust is earned from verified real-world signals — never from XP or login.
          </p>
        </div>
      </MotionCard>

      <XPJourney totalXp={userXp.total_xp} unlocks={xpUnlockCatalog} />

      <MotionItem>
        <DailyMissions missions={dailyMissions} />
      </MotionItem>

      <MotionItem>
        <AchievementGrid achievements={achievements.slice(0, 4)} title="Recent achievements" />
      </MotionItem>
    </MotionPage>
  );
}
