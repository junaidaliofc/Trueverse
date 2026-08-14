"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import type { TrustLevel } from "@/lib/design";
import { mockPostsForTab, type MockFeedTab } from "@/lib/community-mock";
import { CommunityComposer } from "@/components/community/composer";
import { CommunityFeedTabs } from "@/components/community/feed-tabs";
import { CommunityFeedList } from "@/components/community/feed-list";
import { CommunitySidebarLeft } from "@/components/community/sidebar-left";
import { CommunitySidebarRight } from "@/components/community/sidebar-right";

export function CommunityFeed({
  profile,
  trustLevel,
  xpLevel,
  streak,
  suggested
}: {
  profile: Profile;
  trustLevel: TrustLevel;
  xpLevel: number;
  streak: number;
  suggested: Profile[];
}) {
  const [tab, setTab] = useState<MockFeedTab>("for_you");
  const posts = mockPostsForTab(tab);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[220px_minmax(0,1fr)_240px] xl:grid-cols-[240px_minmax(0,1fr)_260px]">
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <CommunitySidebarLeft
            profile={profile}
            trustLevel={trustLevel}
            xpLevel={xpLevel}
            streak={streak}
          />
        </div>
      </div>

      <div className="min-w-0 space-y-5">
        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Community
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Feed
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            A living neighborhood of reputation — not likes. Sample posts illustrate
            the feed until live publishing is connected.
          </p>
        </header>

        <CommunityComposer
          authorName={profile.full_name || "Member"}
          authorPhoto={profile.photo_url}
        />

        <CommunityFeedTabs value={tab} onChange={(next) => setTab(next as MockFeedTab)} />

        <CommunityFeedList posts={posts} viewerId={profile.id} mock />
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-20">
          <CommunitySidebarRight
            missionTitle="Share one helpful moment"
            missionBody="Appreciate someone or post an update — engagement never changes trust."
            suggested={suggested}
          />
        </div>
      </div>
    </div>
  );
}
