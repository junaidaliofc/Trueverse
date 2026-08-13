import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { fetchSavedPosts } from "@/lib/community-server";
import { CommunityFeedList } from "@/components/community/feed-list";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved posts",
  description: "Your privately saved Trueverse community posts."
};

export default async function SavedPostsPage() {
  const { supabase, profile } = await requireProfile();
  const { posts, error } = await fetchSavedPosts(supabase, profile.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Private
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
            Saved posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Only you can see what you save. No public bookmark counts.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/community">Back to feed</Link>
        </Button>
      </div>

      {error && /does not exist|relation/i.test(error) ? (
        <p className="rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">
          Apply migration 008_community_feed.sql in Supabase to enable saves.
        </p>
      ) : null}

      <CommunityFeedList posts={posts} viewerId={profile.id} />
    </div>
  );
}
