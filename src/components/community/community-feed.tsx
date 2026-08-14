"use client";

import { useCallback, useState } from "react";
import type { CommunityPostView, Profile } from "@/lib/types";
import type { TrustLevel } from "@/lib/design";
import type { CommunityFeedTab } from "@/lib/community";
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
  suggested,
  initialPosts,
  initialTab = "for_you"
}: {
  profile: Profile;
  trustLevel: TrustLevel;
  xpLevel: number;
  streak: number;
  suggested: Profile[];
  initialPosts: CommunityPostView[];
  initialTab?: CommunityFeedTab;
}) {
  const [tab, setTab] = useState<CommunityFeedTab>(initialTab);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (nextTab: CommunityFeedTab, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/community/posts?tab=${nextTab}`);
      const payload = await response.json().catch(() => ({}));
      setPosts(payload.posts ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function changeTab(next: CommunityFeedTab) {
    setTab(next);
    void load(next);
  }

  const viewer = {
    id: profile.id,
    full_name: profile.full_name,
    photo_url: profile.photo_url,
    trust_score: profile.trust_score,
    trueverse_id: profile.trueverse_id,
    username: profile.username
  };

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
            Create a post, appreciate neighbors, and keep the conversation going.
            Engagement never changes Trust Score.
          </p>
        </header>

        <CommunityComposer
          authorName={profile.full_name || "Member"}
          authorPhoto={profile.photo_url}
          onCreated={() => void load(tab, true)}
        />

        <CommunityFeedTabs value={tab} onChange={changeTab} />

        <CommunityFeedList posts={posts} viewerId={profile.id} viewer={viewer} loading={loading} />
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
