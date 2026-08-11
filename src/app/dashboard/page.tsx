import { requireProfile, profileTrustIndex } from "@/lib/auth";
import { getGreeting } from "@/lib/utils";
import { scoreToTrustLevel, TRUST_LEVEL_META } from "@/lib/design";
import { TrustStars } from "@/components/trust/trust-reputation-card";
import { StreakHero } from "@/components/xp/streak-hero";
import { XPJourney } from "@/components/xp/xp-journey";
import { DailyMissions } from "@/components/missions/daily-missions";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";
import { BadgeCheck } from "lucide-react";
import { dailyMissions } from "@/lib/dummy-data";
import type { XpUnlock } from "@/lib/xp-engine";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { supabase, profile } = await requireProfile();

  const { data: xpRow } = await supabase
    .from("user_xp")
    .select("total_xp, daily_streak")
    .eq("profile_id", profile.id)
    .maybeSingle<{ total_xp: number; daily_streak: number }>();

  const totalXp = xpRow?.total_xp ?? 0;
  const trustIndex = profileTrustIndex(profile);
  const level = scoreToTrustLevel(trustIndex);
  const meta = TRUST_LEVEL_META[level];
  const firstName = (profile.full_name || "there").split(" ")[0] ?? "there";
  const identityVerified = Boolean(profile.identity_verified);
  const streakDays = xpRow?.daily_streak ?? profile.streak ?? 0;

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

  const missions = dailyMissions.map((mission) => ({
    ...mission,
    progress: 0,
    completed: false
  }));

  return (
    <MotionPage className="mx-auto max-w-lg space-y-5 sm:space-y-6">
      <MotionItem className="pt-1">
        <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {firstName}
        </h1>
      </MotionItem>

      <StreakHero
        streak={{
          daily: streakDays,
          weekly: 0,
          monthly: 0,
          lastActiveDate: ""
        }}
      />

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Trust level</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight">{meta.label}</p>
          <div className="mt-3">
            <TrustStars stars={meta.stars} />
          </div>
          {identityVerified ? (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-success">
              <BadgeCheck className="size-4" aria-hidden />
              Verified Identity
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Identity not verified yet
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Trust is earned from verified real-world signals — never from XP or login.
          </p>
        </div>
      </MotionCard>

      <XPJourney totalXp={totalXp} unlocks={unlocks} />

      <MotionItem>
        <DailyMissions missions={missions} />
      </MotionItem>

      <MotionItem className="glass rounded-[1.75rem] px-6 py-10 text-center">
        <p className="font-display text-lg font-bold">No achievements yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete missions and Trust Acts to unlock cosmetics. XP never changes trust.
        </p>
      </MotionItem>
    </MotionPage>
  );
}
