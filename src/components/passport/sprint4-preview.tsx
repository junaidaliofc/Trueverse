"use client";

import { currentUser } from "@/lib/dummy-data";
import type { Profile } from "@/lib/types";
import {
  PASSPORT_EMPTY_SCORES,
  PASSPORT_EMPTY_STEPS,
  PASSPORT_LOCKED_BADGES,
  PASSPORT_MOCK_BADGES,
  PASSPORT_MOCK_SCORES,
  PASSPORT_MOCK_TIMELINE,
  PASSPORT_TODAY_GAINS
} from "@/lib/passport-mock";
import { PassportBadgeBoard } from "@/components/passport/passport-badge-board";
import { PassportGettingStarted } from "@/components/passport/passport-getting-started";
import { PassportIdentityCard } from "@/components/passport/passport-identity-card";
import { PassportReputationGrid } from "@/components/passport/passport-reputation-grid";
import { PassportStoryTimeline } from "@/components/passport/passport-story-timeline";
import { PassportTodayProgress } from "@/components/passport/passport-today-progress";

const showcaseProfile: Profile = {
  ...currentUser,
  photo_url: currentUser.photo_url,
  headline: "Neighborhood organizer",
  city: "Portland"
};

const newNeighbor: Profile = {
  id: "user-new",
  email: "jordan@trueverse.app",
  full_name: "New neighbor",
  photo_url: null,
  bio: "",
  trust_score: 8,
  streak: 0,
  trueverse_id: "tv_jordan",
  username: "jordan",
  role: "member",
  is_disabled: false,
  last_positive_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export function Sprint4Preview() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 4 preview
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Passport 2.0
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Digital Reputation Passport. Mock data only — no backend changes.
          Authenticated owners see this composition on /passport.
        </p>
      </header>

      <section id="identity" className="space-y-4">
        <PassportIdentityCard
          profile={showcaseProfile}
          username={showcaseProfile.username ?? "ariamorgan"}
          trustLevel="established"
          emailVerified
          identityVerified
          shareHref="/u/ariamorgan/share"
        />
      </section>

      <section id="scores">
        <PassportReputationGrid snapshot={PASSPORT_MOCK_SCORES} />
      </section>

      <section id="today">
        <PassportTodayProgress gains={PASSPORT_TODAY_GAINS} />
      </section>

      <section id="badges">
        <PassportBadgeBoard badges={PASSPORT_MOCK_BADGES} />
      </section>

      <section id="timeline">
        <PassportStoryTimeline events={PASSPORT_MOCK_TIMELINE} />
      </section>

      <section id="empty" className="space-y-4 border-t border-border/60 pt-10">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Empty state
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            New neighbor
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Incomplete profiles get starting actions instead of blank components.
          </p>
        </div>
        <PassportIdentityCard
          profile={newNeighbor}
          username="jordan"
          trustLevel="new"
          emailVerified={false}
          identityVerified={false}
          shareHref="/u/jordan/share"
        />
        <PassportGettingStarted steps={PASSPORT_EMPTY_STEPS} />
        <PassportReputationGrid snapshot={PASSPORT_EMPTY_SCORES} />
        <PassportBadgeBoard badges={PASSPORT_LOCKED_BADGES} />
      </section>
    </div>
  );
}
