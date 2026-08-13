"use client";

import type { CommunityPostView } from "@/lib/types";
import { buildFeedEntries } from "@/lib/community";
import { CommunityFeedCard, SponsoredFeedSlot } from "@/components/community/feed-card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityFeedList({
  posts,
  viewerId,
  loading
}: {
  posts: CommunityPostView[];
  viewerId?: string | null;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass space-y-3 rounded-[1.75rem] p-5">
            <div className="flex gap-3">
              <Skeleton className="size-11 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="glass rounded-[1.75rem] px-5 py-12 text-center">
        <p className="font-display text-lg font-bold text-foreground">
          No posts yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Share a community update, ask for help, or recognize someone with a
          Positive Trust Act post. Your feed stays empty until real activity
          appears — no fake posts.
        </p>
      </div>
    );
  }

  const entries = buildFeedEntries(posts);

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        if (entry.kind === "sponsored") {
          // Architecture hook for future ads — intentionally not rendered.
          return <SponsoredFeedSlot key={entry.id} id={entry.id} />;
        }
        return (
          <CommunityFeedCard
            key={entry.id}
            post={entry.post}
            index={index}
            viewerId={viewerId}
          />
        );
      })}
    </div>
  );
}
