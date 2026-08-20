import { passportUsername } from "@/lib/passport";
import type { CommunityPostView, Profile } from "@/lib/types";

export type SearchKind = "member" | "passport" | "post" | "community" | "event" | "business";

export type SearchHit = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  photo_url?: string | null;
};

export const SEARCH_EMPTY_COPY = "Search members, communities or reputation.";

export const POPULAR_SEARCHES = ["Sarah", "westside", "book", "trust", "bakery"] as const;

export const SEARCH_KINDS: SearchKind[] = [
  "member",
  "passport",
  "post",
  "community",
  "event",
  "business"
];

export function matchesQuery(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query.trim().toLowerCase().replace(/^@/, ""));
}

export function profileToSearchHits(profile: Profile): SearchHit[] {
  const handle = passportUsername(profile);
  const href = `/u/${handle}`;
  return [
    {
      id: `member-${profile.id}`,
      kind: "member",
      title: profile.full_name || "Trueverse Member",
      subtitle: profile.trueverse_id,
      href,
      photo_url: profile.photo_url
    },
    {
      id: `passport-${profile.id}`,
      kind: "passport",
      title: `${profile.full_name || handle} Passport`,
      subtitle: `@${handle}`,
      href,
      photo_url: profile.photo_url
    }
  ];
}

export function postToSearchHit(post: CommunityPostView): SearchHit {
  const name = post.author?.full_name || "Community post";
  return {
    id: `post-${post.id}`,
    kind: "post",
    title: post.title || post.body.slice(0, 72),
    subtitle: name,
    href: `/community/post/${post.id}`
  };
}

export function groupSearchHits(hits: SearchHit[]) {
  return SEARCH_KINDS.map((kind) => ({ kind, items: hits.filter((hit) => hit.kind === kind) })).filter(
    (group) => group.items.length > 0
  );
}
