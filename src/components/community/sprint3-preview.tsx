"use client";

import { ReputationDashboard } from "@/components/reputation/reputation-dashboard";
import { DailyMissionsCard } from "@/components/missions/daily-missions-card";
import { CommunityFeedList } from "@/components/community/feed-list";
import { CommunityFeedTabs } from "@/components/community/feed-tabs";
import { CommunityComposer } from "@/components/community/composer";
import { mockPostsForTab } from "@/lib/community-mock";
import { dailyMissions } from "@/lib/dummy-data";
import { buildReputationSnapshot } from "@/lib/reputation";

export function Sprint3Preview() {
  const posts = mockPostsForTab("for_you");
  const snapshot = buildReputationSnapshot(
    {
      id: "preview",
      email: null,
      full_name: "Preview Member",
      photo_url: null,
      bio: "Community volunteer",
      trust_score: 92,
      streak: 4,
      trueverse_id: "tv_preview",
      username: "preview",
      role: "member",
      is_disabled: false,
      last_positive_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trust_index: 92,
      identity_verified: true,
      trust_acts: 8,
      appreciations_count: 12
    },
    { emailVerified: true, totalXp: 420 }
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 3 preview
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold text-foreground">
          Reputation + Community
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Design preview using mock feed content. Live Home still uses the authenticated profile.
        </p>
      </header>

      <div id="reputation">
        <ReputationDashboard snapshot={snapshot} />
      </div>

      <div id="missions">
        <DailyMissionsCard
          missions={dailyMissions.map((mission) => ({
            id: mission.id,
            title: mission.title,
            description: mission.description,
            href: mission.href ?? "/community",
            completed: mission.completed,
            progress: mission.progress,
            target: mission.target
          }))}
        />
      </div>

      <div id="feed" className="space-y-4">
        <CommunityComposer authorName="Preview Member" />
        <CommunityFeedTabs value="for_you" onChange={() => undefined} />
        <CommunityFeedList posts={posts} mock />
      </div>
    </div>
  );
}
