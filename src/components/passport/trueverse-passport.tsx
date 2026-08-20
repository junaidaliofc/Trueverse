"use client";

import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import type { PassportMode, PassportViewModel } from "@/lib/passport";
import { MotionItem, MotionPage } from "@/components/motion/primitives";
import { PassportHero } from "@/components/passport/passport-hero";
import { PassportVerification } from "@/components/passport/verification-section";
import { PassportBadgeGallery } from "@/components/passport/badge-gallery";
import { PassportReputationSummary } from "@/components/passport/reputation-summary";
import { PassportReputationTimeline } from "@/components/passport/reputation-timeline";
import { PassportStatistics } from "@/components/passport/passport-stats";
import { PassportSharePanel } from "@/components/passport/passport-share-panel";
import { FollowButton } from "@/components/social/follow-button";
import { MessageButton } from "@/components/messages/message-button";
import { cn } from "@/lib/utils";

export function TrueversePassport({
  passport,
  mode = "owner",
  emailVerified = false,
  initialFollowing = false,
  className
}: {
  passport: PassportViewModel;
  mode?: PassportMode;
  emailVerified?: boolean;
  initialFollowing?: boolean;
  className?: string;
}) {
  const isOwner = mode === "owner";
  const { privacy } = passport;
  const shareHref = `${passport.sharePath}/share`;
  const memberSince = new Date(passport.profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  return (
    <MotionPage className={cn("mx-auto max-w-lg space-y-8 sm:max-w-3xl", className)}>
      {!isOwner ? (
        <MotionItem className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              Public Passport
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Verified reputation signals — not a safety guarantee.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MessageButton trueverseId={passport.trueverseId} />
            <FollowButton
              trueverseId={passport.trueverseId}
              initialFollowing={initialFollowing}
            />
          </div>
        </MotionItem>
      ) : null}

      <MotionItem>
        <PassportHero
          profile={passport.profile}
          username={passport.username}
          trustLevel={passport.trustLevel}
          emailVerified={emailVerified}
          identityVerified={passport.identityVerified}
          xpLevel={passport.xpLevel}
          profileCompletion={passport.profileCompletion}
          shareHref={shareHref}
          qrHref={shareHref}
          isOwner={isOwner}
        />
      </MotionItem>

      {passport.bio ? (
        <MotionItem>
          <p className="px-1 text-sm leading-6 text-muted-foreground">{passport.bio}</p>
        </MotionItem>
      ) : null}

      <MotionItem>
        <PassportReputationSummary
          trustLevel={passport.trustLevel}
          trustIndex={passport.trustIndex}
          stats={passport.stats}
          memberSince={memberSince}
        />
      </MotionItem>

      <MotionItem>
        <PassportVerification
          items={passport.verifications.filter((item) => item.kind !== "organization")}
          hidden={mode === "public" && !privacy.showVerifications}
        />
      </MotionItem>

      <MotionItem>
        <PassportBadgeGallery
          badges={passport.badges}
          hidden={mode === "public" && !privacy.showBadges}
        />
      </MotionItem>

      <MotionItem>
        <PassportReputationTimeline
          events={passport.timeline}
          hidden={mode === "public" && !privacy.showTimeline}
        />
      </MotionItem>

      <MotionItem>
        <PassportStatistics
          stats={passport.stats}
          hidden={mode === "public" && !privacy.showStatistics}
        />
      </MotionItem>

      <MotionItem>
        <PassportSharePanel
          sharePath={passport.sharePath}
          displayName={passport.displayName}
          trueverseId={passport.trueverseId}
        />
      </MotionItem>

      <p className="pb-6 text-center text-xs leading-5 text-muted-foreground">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </MotionPage>
  );
}
