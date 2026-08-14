import type { SupabaseClient } from "@supabase/supabase-js";
import { groupSearchHits, type SearchHit } from "@/lib/search";
import { DISCOVER_COMMUNITIES, PLACEHOLDER_BUSINESSES, PLACEHOLDER_EVENTS } from "@/lib/communities";
import { passportUsername } from "@/lib/passport";

type SearchProfile = {
  id: string;
  full_name: string;
  photo_url: string | null;
  trueverse_id: string;
  username?: string | null;
};

function sanitize(term: string) {
  return term
    .replace(/^@/, "")
    .replace(/[%_,.()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

export async function searchPlatform(
  supabase: SupabaseClient,
  query: string
): Promise<{ hits: SearchHit[]; groups: ReturnType<typeof groupSearchHits>; error?: string }> {
  const term = sanitize(query);
  if (!term) return { hits: [], groups: [] };

  const [{ data: people, error: peopleError }, { data: posts, error: postError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, photo_url, trueverse_id, username, bio")
        .eq("is_disabled", false)
        .or(
          `full_name.ilike.%${term}%,trueverse_id.ilike.%${term}%,username.ilike.%${term}%`
        )
        .limit(8),
      supabase
        .from("community_posts")
        .select("id, title, body, author_id")
        .or(`title.ilike.%${term}%,body.ilike.%${term}%`)
        .eq("is_hidden", false)
        .limit(6)
    ]);

  if (peopleError && !/does not exist|relation/i.test(peopleError.message)) {
    return { hits: [], groups: [], error: peopleError.message };
  }
  if (postError && !/does not exist|relation/i.test(postError.message)) {
    return { hits: [], groups: [], error: postError.message };
  }

  const memberHits: SearchHit[] = ((people ?? []) as SearchProfile[]).flatMap((profile) => {
    const handle = passportUsername(profile);
    const href = `/u/${handle}`;
    return [
      {
        id: `member-${profile.id}`,
        kind: "member" as const,
        title: profile.full_name || "Trueverse Member",
        subtitle: profile.trueverse_id,
        href,
        photo_url: profile.photo_url
      },
      {
        id: `passport-${profile.id}`,
        kind: "passport" as const,
        title: `${profile.full_name || handle} Passport`,
        subtitle: `@${handle}`,
        href,
        photo_url: profile.photo_url
      }
    ];
  });

  const postHits: SearchHit[] = (
    (posts ?? []) as Array<{ id: string; title: string | null; body: string }>
  ).map((post) => ({
    id: `post-${post.id}`,
    kind: "post" as const,
    title: post.title || post.body.slice(0, 72),
    subtitle: "Community post",
    href: `/community/post/${post.id}`
  }));

  const communityHits: SearchHit[] = DISCOVER_COMMUNITIES.filter((item) =>
    `${item.name} ${item.topic} ${item.blurb}`.toLowerCase().includes(term.toLowerCase())
  ).map((item) => ({
    id: `community-${item.id}`,
    kind: "community" as const,
    title: item.name,
    subtitle: item.topic,
    href: `/community/discover?topic=${encodeURIComponent(item.topic)}`
  }));

  const eventHits: SearchHit[] = PLACEHOLDER_EVENTS.filter((item) =>
    `${item.title} ${item.place}`.toLowerCase().includes(term.toLowerCase())
  ).map((item) => ({
    id: `event-${item.id}`,
    kind: "event" as const,
    title: item.title,
    subtitle: `${item.place} · coming soon`,
    href: "/community/discover"
  }));

  const businessHits: SearchHit[] = PLACEHOLDER_BUSINESSES.filter((item) =>
    `${item.name} ${item.place} ${item.blurb}`.toLowerCase().includes(term.toLowerCase())
  ).map((item) => ({
    id: `business-${item.id}`,
    kind: "business" as const,
    title: item.name,
    subtitle: `${item.place} · coming soon`,
    href: "/community/discover?topic=Business"
  }));

  const hits = [...memberHits, ...postHits, ...communityHits, ...eventHits, ...businessHits].slice(
    0,
    28
  );
  return { hits, groups: groupSearchHits(hits) };
}
