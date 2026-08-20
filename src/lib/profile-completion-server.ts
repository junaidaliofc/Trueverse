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
  const [trustActs, posts, followCount] = await Promise.all([
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
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", profile.id)
    )
  ]);

  const skills =
    (Array.isArray(profile.skills) && profile.skills.length > 0) ||
    (Array.isArray(profile.interests) && profile.interests.length > 0);

  return buildProfileCompletion({
    email: emailVerified,
    photo: Boolean(profile.photo_url),
    bio: Boolean(profile.bio?.trim()),
    location: Boolean(profile.city?.trim()),
    skills,
    communities: posts > 0 || followCount > 0,
    trustAct: trustActs > 0,
    identity: Boolean(profile.identity_verified)
  });
}
