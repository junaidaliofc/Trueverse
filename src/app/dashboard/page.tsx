import { requireProfile, profileTrustIndex } from "@/lib/auth";
import { getGreeting } from "@/lib/utils";
import { scoreToTrustLevel } from "@/lib/design";
import { StreakHero } from "@/components/xp/streak-hero";
import { XPJourney } from "@/components/xp/xp-journey";
import { DailyMissionsCard } from "@/components/missions/daily-missions-card";
import { ReputationDashboard } from "@/components/reputation/reputation-dashboard";
import { MotionItem, MotionPage } from "@/components/motion/primitives";
import { buildReputationSnapshot } from "@/lib/reputation";
import { dailyMissions } from "@/lib/dummy-data";
import type { XpUnlock } from "@/lib/xp-engine";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { supabase, user, profile } = await requireProfile();

  const { data: xpRow } = await supabase
    .from("user_xp")
    .select("total_xp, daily_streak")
    .eq("profile_id", profile.id)
    .maybeSingle<{ total_xp: number; daily_streak: number }>();

  const totalXp = xpRow?.total_xp ?? 0;
  const trustIndex = profileTrustIndex(profile);
  const firstName = (profile.full_name || "there").split(" ")[0] ?? "there";
  const streakDays = xpRow?.daily_streak ?? profile.streak ?? 0;
  const snapshot = buildReputationSnapshot(profile, {
    emailVerified: Boolean(user.email_confirmed_at),
    totalXp
  });

  const unlocks: XpUnlock[] = [
    {
      id: "u-level-2",
      kind: "level",
      title: "Level 2",
      description: "Keep completing missions to unlock cosmetics.",
      requiredLevel: 2,
      unlocked: false
    }
  ];

  const missions = dailyMissions.map((mission) => {
    if (mission.id === "daily-profile") {
      const complete = Boolean(profile.full_name && profile.photo_url && profile.bio);
      return { ...mission, completed: complete, progress: complete ? 1 : 0 };
    }
    if (mission.id === "daily-appreciate") {
      return { ...mission, completed: true, progress: 1 };
    }
    return { ...mission, completed: false, progress: 0 };
  });

  return (
    <MotionPage className="mx-auto max-w-lg space-y-5 sm:max-w-3xl sm:space-y-6">
      <MotionItem className="pt-1">
        <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {firstName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Reputation first. Trust level {scoreToTrustLevel(trustIndex)} stays independent of XP.
        </p>
      </MotionItem>

      <StreakHero
        streak={{
          daily: streakDays,
          weekly: 0,
          monthly: 0,
          lastActiveDate: ""
        }}
      />

      <ReputationDashboard snapshot={snapshot} />

      <DailyMissionsCard
        missions={missions.map((mission) => ({
          id: mission.id,
          title: mission.title,
          description: mission.description,
          href: mission.href ?? "/community",
          completed: mission.completed,
          progress: mission.progress,
          target: mission.target
        }))}
      />

      <XPJourney totalXp={totalXp} unlocks={unlocks} />

      <MotionItem className="glass-elevated rounded-[1.75rem] px-6 py-10 text-center">
        <p className="font-display text-lg font-bold text-foreground">No achievements yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete missions and Trust Acts to unlock cosmetics. XP never changes trust.
        </p>
      </MotionItem>
    </MotionPage>
  );
}
