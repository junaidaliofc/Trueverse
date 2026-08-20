import { profiles } from "@/lib/dummy-data";
import { mockPostsForTab } from "@/lib/community-mock";
import { DISCOVER_COMMUNITIES, PLACEHOLDER_BUSINESSES, PLACEHOLDER_EVENTS } from "@/lib/communities";
import {
  groupSearchHits,
  matchesQuery,
  postToSearchHit,
  profileToSearchHits,
  type SearchHit
} from "@/lib/search";

export function searchMockCatalog(query: string): SearchHit[] {
  const q = query.trim();
  if (q.length < 1) return [];

  const people = profiles.flatMap(profileToSearchHits).filter((hit) => {
    return matchesQuery(`${hit.title} ${hit.subtitle}`, q);
  });

  const posts = mockPostsForTab("for_you")
    .map(postToSearchHit)
    .filter((hit) => matchesQuery(`${hit.title} ${hit.subtitle}`, q));

  const communities = DISCOVER_COMMUNITIES.filter((item) =>
    matchesQuery(`${item.name} ${item.topic} ${item.blurb}`, q)
  ).map(
    (item): SearchHit => ({
      id: `community-${item.id}`,
      kind: "community",
      title: item.name,
      subtitle: item.topic,
      href: `/community/discover?topic=${encodeURIComponent(item.topic)}`
    })
  );

  const events = PLACEHOLDER_EVENTS.filter((item) =>
    matchesQuery(`${item.title} ${item.place}`, q)
  ).map(
    (item): SearchHit => ({
      id: `event-${item.id}`,
      kind: "event",
      title: item.title,
      subtitle: item.place,
      href: "/community/discover"
    })
  );

  const businesses = PLACEHOLDER_BUSINESSES.filter((item) =>
    matchesQuery(`${item.name} ${item.place} ${item.blurb}`, q)
  ).map(
    (item): SearchHit => ({
      id: `business-${item.id}`,
      kind: "business",
      title: item.name,
      subtitle: item.place,
      href: "/community/discover?topic=Business"
    })
  );

  return [...people, ...posts, ...communities, ...events, ...businesses].slice(0, 28);
}

export function groupedMockSearch(query: string) {
  return groupSearchHits(searchMockCatalog(query));
}
