"use client";

import Link from "next/link";
import {
  achievements,
  currentUser,
  currentUserReputation,
  profileTimeline,
  userXp,
  xpUnlockCatalog
} from "@/lib/dummy-data";
import { PRODUCT_DISCLAIMER } from "@/lib/design";
import { ProfileCard } from "@/components/profile/profile-card";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { XPJourney } from "@/components/xp/xp-journey";
import { ActivityTimeline } from "@/components/activity/timeline";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { MotionItem, MotionPage } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";

/**
 * Phase 2 Profile — living activity timeline replaces static history blocks.
 */
export default function ProfilePage() {
  return (
    <MotionPage className="mx-auto max-w-lg space-y-6 sm:max-w-3xl">
      <MotionItem className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Profile</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Your identity</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Share verified signals anywhere. XP decorations stay separate from trust.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href={`/u/${currentUser.trueverse_id}`}>Public</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/u/${currentUser.trueverse_id}/share`}>Share</Link>
          </Button>
        </div>
      </MotionItem>

      <MotionItem>
        <ProfileCard profile={currentUser} xp={userXp.total_xp} streak={currentUser.streak} />
      </MotionItem>

      <TrustReputationCard
        stats={{
          trustIndex: currentUserReputation.trustIndex,
          identityVerified: currentUserReputation.identityVerified,
          trustActs: currentUserReputation.trustActs,
          appreciations: currentUserReputation.appreciations,
          communityRank: currentUserReputation.communityRank
        }}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ReputationDnaCard dna={currentUserReputation.dna} />
        <XPJourney totalXp={userXp.total_xp} unlocks={xpUnlockCatalog} />
      </div>

      <ActivityTimeline events={profileTimeline} title="Activity timeline" />

      <AchievementGrid achievements={achievements} />

      <p className="pb-4 text-center text-xs leading-5 text-muted-foreground">{PRODUCT_DISCLAIMER}</p>
    </MotionPage>
  );
}
