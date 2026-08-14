"use client";

import { useState } from "react";
import type { CommunityPostView } from "@/lib/types";
import { CommunityFeedCard } from "@/components/community/feed-card";
import { CommunityComposer } from "@/components/community/composer";
import { CommunityFeedTabs } from "@/components/community/feed-tabs";
import { CommunityFeedList } from "@/components/community/feed-list";
import { CommunitySidebarLeft } from "@/components/community/sidebar-left";
import { CommunitySidebarRight } from "@/components/community/sidebar-right";

/** Design-kit sample only — never used in authenticated Community data paths. */
const SAMPLE_POST: CommunityPostView = {
  id: "00000000-0000-4000-8000-000000000001",
  author_id: "00000000-0000-4000-8000-000000000099",
  post_type: "update",
  title: "Neighborhood cleanup this Saturday",
  body: "Meeting at the community garden at 9am. Bring gloves if you have them — all skill levels welcome.",
  image_url: null,
  category: "Neighborhood",
  location: "Westside garden",
  trust_act_id: null,
  is_hidden: false,
  moderation_status: "visible",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: {
    id: "00000000-0000-4000-8000-000000000099",
    full_name: "Sample Member",
    photo_url: null,
    trust_score: 42,
    trueverse_id: "tv_samplemember",
    username: "samplemember"
  },
  like_count: 0,
  appreciate_count: 0,
  comment_count: 0,
  liked_by_me: false,
  appreciated_by_me: false,
  bookmarked_by_me: false
};

const SAMPLE_PROFILE = {
  id: "00000000-0000-4000-8000-000000000099",
  email: null,
  full_name: "Sample Member",
  photo_url: null,
  bio: "",
  trust_score: 42,
  streak: 0,
  trueverse_id: "tv_samplemember",
  username: "samplemember",
  role: "member" as const,
  is_disabled: false,
  last_positive_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export function CommunityFeedPreviewSamples() {
  const [desktop] = useState(true);

  return (
    <div className="space-y-6">
      <CommunityComposer authorName="Sample Member" authorPhoto={null} />
      <CommunityFeedTabs value="for_you" onChange={() => undefined} />

      <div
        className={
          desktop
            ? "grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_240px]"
            : "space-y-4"
        }
      >
        <div className="hidden lg:block">
          <CommunitySidebarLeft
            profile={SAMPLE_PROFILE}
            trustLevel="developing"
            xpLevel={1}
            streak={0}
          />
        </div>
        <div className="min-w-0 space-y-4">
        <CommunityFeedCard post={SAMPLE_POST} mock />
        <CommunityFeedList posts={[SAMPLE_POST]} mock />
        </div>
        <div className="hidden lg:block">
          <CommunitySidebarRight
            missionTitle="Share one helpful moment"
            missionBody="Engagement never changes trust."
            suggested={[]}
          />
        </div>
      </div>
    </div>
  );
}
