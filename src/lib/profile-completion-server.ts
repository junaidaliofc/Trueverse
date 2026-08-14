import type { SupabaseClient } from "@supabase/supabase-js";
import { buildProfileCompletion, type ProfileCompletion } from "@/lib/profile-completion";
import type { LiveProfile } from "@/lib/auth";

async function countOrZero(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>
) {
  const { count, error } = await query;
  if (error) return 0;
  return count ?? 0;
}

export async function fetchProfileCompletion(
  supabase: SupabaseClient,
  profile: LiveProfile,
  emailVerified: boolean
): Promise<ProfileCompletion> {
  const [trustActs, posts, appreciations, followCount] = await Promise.all([
    countOrZero(
      supabase
        .from("positive_interactions")
        .select("id", { count: "exact", head: true })
        .or(`author_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .eq("status", "accepted")
    ),
    countOrZero(
      supabase
        .from("community_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", profile.id)
    ),
    countOrZero(
      supabase
        .from("community_reactions")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("reaction_type", "appreciate")
    ),
    countOrZero(
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", profile.id)
    )
  ]);

  const hasPost = posts > 0;

  return buildProfileCompletion({
    photo: Boolean(profile.photo_url),
    name: Boolean(profile.full_name?.trim()),
    bio: Boolean(profile.bio?.trim()),
    email: emailVerified,
    trustAct: trustActs > 0,
    communityPost: hasPost,
    appreciation: appreciations > 0,
    joinCommunity: hasPost || followCount > 0,
    followFive: followCount >= 5
  });
}
