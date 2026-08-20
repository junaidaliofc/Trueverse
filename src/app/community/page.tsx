import type { Metadata } from "next";
import { requireProfile, profileTrustIndex } from "@/lib/auth";
import { scoreToTrustLevel } from "@/lib/design";
import { xpToLevel } from "@/lib/xp-engine";
import { fetchCommunityFeed } from "@/lib/community-server";
import { CommunityFeed } from "@/components/community/community-feed";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community",
  description: "Trueverse community feed — updates, help, events, and recognition."
};

export default async function CommunityPage() {
  const { supabase, profile } = await requireProfile();

  const [{ data: xpRow }, suggestedRes, feed] = await Promise.all([
    supabase
      .from("user_xp")
      .select("total_xp, daily_streak")
      .eq("profile_id", profile.id)
      .maybeSingle<{ total_xp: number; daily_streak: number }>(),
    supabase
      .from("profiles")
      .select(
        "id, full_name, photo_url, bio, trust_score, streak, trueverse_id, username, city, headline, interests, social_links, role, is_disabled, last_positive_at, created_at, updated_at"
      )
      .eq("is_disabled", false)
      .neq("id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6),
    fetchCommunityFeed(supabase, { tab: "for_you", viewerId: profile.id, limit: 40 })
  ]);

  const totalXp = xpRow?.total_xp ?? 0;
  const streak = xpRow?.daily_streak ?? profile.streak ?? 0;
  const trustLevel = scoreToTrustLevel(profileTrustIndex(profile));

  return (
    <CommunityFeed
      profile={profile}
      trustLevel={trustLevel}
      xpLevel={xpToLevel(totalXp).level}
      streak={streak}
      suggested={(suggestedRes.data ?? []) as Profile[]}
      initialPosts={feed.posts}
    />
  );
}
