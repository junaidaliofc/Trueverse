import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockPostsForTab } from "@/lib/community-mock";
import { CommunityFeedCard } from "@/components/community/feed-card";
import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Community post",
    description: `Trueverse community post ${id}`
  };
}

export default async function CommunityPostPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = mockPostsForTab("for_you").concat(
    mockPostsForTab("following"),
    mockPostsForTab("nearby"),
    mockPostsForTab("trending")
  );
  const post = all.find((item) => item.id === id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Community post
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
            Shared moment
          </h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/community">Back to feed</Link>
        </Button>
      </div>

      <CommunityFeedCard post={post} mock />

      <p className="pb-8 text-center text-xs leading-5 text-muted-foreground">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </div>
  );
}
