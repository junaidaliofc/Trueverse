"use client";

import { useCallback, useState, useTransition } from "react";
import type { CommunityPostView, Profile } from "@/lib/types";
import type { CommunityFeedTab } from "@/lib/community";
import type { TrustLevel } from "@/lib/design";
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
  initialPosts,
  initialTab = "for_you",
  suggested,
  migrationRequired
}: {
  profile: Profile;
  trustLevel: TrustLevel;
  xpLevel: number;
  streak: number;
  initialPosts: CommunityPostView[];
  initialTab?: CommunityFeedTab;
  suggested: Profile[];
  migrationRequired?: boolean;
}) {
  const [tab, setTab] = useState<CommunityFeedTab>(initialTab);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState(
    migrationRequired
      ? "Apply migration 008_community_feed.sql in Supabase to enable posting."
      : ""
  );

  const load = useCallback((nextTab: CommunityFeedTab) => {
    setLoading(true);
    startTransition(async () => {
      const response = await fetch(`/api/community/posts?tab=${nextTab}`);
      const payload = await response.json().catch(() => ({}));
      setPosts(payload.posts ?? []);
      if (payload.migrationRequired) {
        setNotice(
          "Apply migration 008_community_feed.sql in Supabase to enable posting."
        );
      }
      setLoading(false);
    });
  }, []);

  function onTabChange(nextTab: CommunityFeedTab) {
    setTab(nextTab);
    load(nextTab);
  }

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

      <div className="min-w-0 space-y-4">
        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Community
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Feed
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily updates, help requests, and recognition — trust stays separate
            from likes.
          </p>
        </header>

        {notice ? (
          <p className="rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">
            {notice}
          </p>
        ) : null}

        <CommunityComposer
          authorName={profile.full_name || "Member"}
          authorPhoto={profile.photo_url}
          onCreated={() => load(tab)}
        />

        <CommunityFeedTabs value={tab} onChange={onTabChange} />

        <CommunityFeedList
          posts={posts}
          viewerId={profile.id}
          loading={loading || pending}
        />
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-20">
          <CommunitySidebarRight
            missionTitle="Share one helpful moment"
            missionBody="Post a Community Update or recognize someone — engagement never changes trust."
            suggested={suggested}
          />
        </div>
      </div>
    </div>
  );
}
