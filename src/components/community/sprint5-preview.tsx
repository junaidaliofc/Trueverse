"use client";

import { CommunityComposer } from "@/components/community/composer";
import { CommunityFeedList } from "@/components/community/feed-list";
import { CommunityFeedTabs } from "@/components/community/feed-tabs";
import { mockPostsForTab } from "@/lib/community-mock";

export function Sprint5Preview() {
  const posts = mockPostsForTab("for_you").slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl space-y-10 py-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 5 preview
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Community interactions
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Create a post, appreciate, comment, and share. Authenticated /community
          uses live Supabase posts. This preview uses sample cards for layout.
        </p>
      </header>

      <section id="composer" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Create post</h2>
        <CommunityComposer authorName="Aria Morgan" />
      </section>

      <section id="feed" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Live-style feed</h2>
        <CommunityFeedTabs value="for_you" onChange={() => undefined} />
        <CommunityFeedList
          posts={posts}
          viewerId="mock-jordan"
          viewer={{
            id: "mock-jordan",
            full_name: "Jordan Hale",
            photo_url: null,
            trust_score: 72,
            trueverse_id: "tv_jordanhale",
            username: "jordanhale"
          }}
          mock
        />
      </section>

      <section id="empty" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Empty state</h2>
        <CommunityFeedList posts={[]} />
      </section>

      <section id="skeleton" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Loading</h2>
        <CommunityFeedList posts={[]} loading />
      </section>
    </div>
  );
}
