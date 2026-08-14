"use client";

import { ProfileForm } from "@/components/profile-form";
import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import {
  PASSPORT_MOCK_BADGES,
  PASSPORT_MOCK_SCORES,
  PASSPORT_MOCK_TIMELINE,
  PASSPORT_TODAY_GAINS,
  withPassportEmptyProgress
} from "@/lib/passport-mock";
import type { PassportViewModel } from "@/lib/passport";

import { PassportBadgeBoard } from "./passport-badge-board";
import { PassportGettingStarted } from "./passport-getting-started";
import { PassportIdentityCard } from "./passport-identity-card";
import { PassportReputationGrid } from "./passport-reputation-grid";
import { PassportSharePanel } from "./passport-share-panel";
import { PassportStoryTimeline } from "./passport-story-timeline";
import { PassportTodayProgress } from "./passport-today-progress";

export function PassportOwnerV2({
  passport,
  emailVerified = false
}: {
  passport: PassportViewModel;
  emailVerified?: boolean;
}) {
  const profileComplete =
    passport.profileCompletion >= 70 && Boolean(passport.profile.full_name?.trim());
  const emptySteps = withPassportEmptyProgress({
    completeProfile: profileComplete,
    emailVerified,
    appreciation: passport.stats.appreciationsReceived > 0,
    trustAct: passport.stats.trustActs > 0
  });
  const showGettingStarted = emptySteps.some((step) => !step.done);
  const shareHref = `${passport.sharePath}/share`;

  const badges = PASSPORT_MOCK_BADGES.map((badge) => {
    if (badge.id === "verified-identity") {
      return { ...badge, earned: passport.identityVerified };
    }
    if (badge.id === "early-member") {
      return { ...badge, earned: true };
    }
    return badge;
  });

  return (
    <div className="mx-auto max-w-lg space-y-8 sm:max-w-3xl">
      <PassportIdentityCard
        profile={passport.profile}
        username={passport.username}
        trustLevel={passport.trustLevel}
        emailVerified={emailVerified}
        identityVerified={passport.identityVerified}
        shareHref={shareHref}
      />

      {showGettingStarted ? <PassportGettingStarted steps={emptySteps} /> : null}

      <PassportReputationGrid snapshot={PASSPORT_MOCK_SCORES} />

      <PassportTodayProgress gains={PASSPORT_TODAY_GAINS} />

      <PassportBadgeBoard badges={badges} />

      <PassportStoryTimeline events={PASSPORT_MOCK_TIMELINE} />

      <PassportSharePanel
        sharePath={passport.sharePath}
        displayName={passport.displayName}
        trueverseId={passport.trueverseId}
      />

      <div id="profile">
        <ProfileForm profile={passport.profile} />
      </div>

      <p className="pb-6 text-center text-xs leading-5 text-muted-foreground">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </div>
  );
}
