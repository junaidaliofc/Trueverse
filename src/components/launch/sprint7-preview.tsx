"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlobalSearchOverlay } from "@/components/search/global-search-overlay";
import {
  NotificationCenter,
  NotificationListSkeleton
} from "@/components/notifications/notification-center";
import { ProfileCompletionCard } from "@/components/onboarding/profile-completion-card";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { PeopleYouMayKnow } from "@/components/social/people-you-may-know";
import { CommunityDiscovery } from "@/components/community/community-discovery";
import { mockNotifications } from "@/lib/notifications-mock";
import { buildProfileCompletion } from "@/lib/profile-completion";
import { suggestPeople } from "@/lib/suggested-people";
import { profiles } from "@/lib/dummy-data";
import { SEARCH_EMPTY_COPY } from "@/lib/search";

const partialCompletion = buildProfileCompletion({
  photo: true,
  name: true,
  bio: false,
  email: true,
  trustAct: true,
  communityPost: false,
  appreciation: true,
  joinCommunity: true,
  followFive: false
});

const completeCompletion = buildProfileCompletion({
  photo: true,
  name: true,
  bio: true,
  email: true,
  trustAct: true,
  communityPost: true,
  appreciation: true,
  joinCommunity: true,
  followFive: true
});

export function Sprint7Preview() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const suggestions = suggestPeople(profiles.slice(1));

  return (
    <div className="mx-auto max-w-4xl space-y-14 py-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 7 preview
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Search, notifications, launch
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Global search, a real notification inbox, profile completion, onboarding, and community
          discovery — without redesigning existing product pages.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => setSearchOpen(true)}>
            Open search
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setOnboardingOpen(true)}>
            Show onboarding
          </Button>
        </div>
      </header>

      <section id="search" className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Global search</h2>
        <p className="text-sm text-muted-foreground">{SEARCH_EMPTY_COPY}</p>
        <div className="glass-elevated rounded-[1.75rem] px-5 py-8 text-center text-sm text-muted-foreground">
          Use Open search. Try “Sarah”, “westside”, or “book”.
        </div>
      </section>

      <section id="notifications" className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Notification center</h2>
        <NotificationCenter items={mockNotifications} local />
      </section>

      <section id="skeleton" className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Loading</h2>
        <NotificationListSkeleton />
      </section>

      <section id="completion" className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Profile completion</h2>
          <ProfileCompletionCard completion={partialCompletion} />
        </div>
        <div>
          <h2 className="mb-3 font-display text-xl font-semibold">Celebrate</h2>
          <ProfileCompletionCard completion={completeCompletion} />
        </div>
      </section>

      <section id="people" className="space-y-3">
        <PeopleYouMayKnow people={suggestions} />
      </section>

      <section id="discover" className="space-y-3">
        <CommunityDiscovery />
      </section>

      {searchOpen ? (
        <GlobalSearchOverlay local onClose={() => setSearchOpen(false)} />
      ) : null}
      <OnboardingFlow local open={onboardingOpen} onDismiss={() => setOnboardingOpen(false)} />
    </div>
  );
}
