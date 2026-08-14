"use client";

import type { CommunityAuthor, CommunityPostView } from "@/lib/types";
import { buildFeedEntries } from "@/lib/community";
import { MOCK_SPONSORED } from "@/lib/community-mock";
import { CommunityFeedCard, SponsoredFeedCard } from "@/components/community/feed-card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityFeedList({
  posts,
  viewerId,
  viewer,
  loading,
  mock = false
}: {
  posts: CommunityPostView[];
  viewerId?: string | null;
  viewer?: CommunityAuthor | null;
  loading?: boolean;
  mock?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-elevated space-y-4 rounded-[1.75rem] p-5">
            <div className="flex gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-11 w-32 rounded-2xl" />
              <Skeleton className="h-11 w-24 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="glass-elevated rounded-[1.75rem] px-5 py-12 text-center">
        <p className="font-display text-lg font-bold text-foreground">Start the conversation</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          No posts here yet. Share a community update, an achievement, or ask for help
          using the composer above.
        </p>
      </div>
    );
  }

  const entries = buildFeedEntries(posts, {
    every: 10,
    sponsored: MOCK_SPONSORED
  });

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        if (entry.kind === "sponsored") {
          return (
            <SponsoredFeedCard
              key={entry.id}
              advertiser={entry.advertiser ?? MOCK_SPONSORED.advertiser}
              title={entry.title ?? MOCK_SPONSORED.title}
              body={entry.body ?? MOCK_SPONSORED.body}
            />
          );
        }
        return (
          <CommunityFeedCard
            key={entry.id}
            post={entry.post}
            index={index}
            viewerId={viewerId}
            viewer={viewer}
            mock={mock}
          />
        );
      })}
    </div>
  );
}
