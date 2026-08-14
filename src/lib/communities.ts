export type DiscoverTopic =
  | "Trending"
  | "Newest"
  | "Nearby"
  | "Technology"
  | "Neighborhood"
  | "Volunteering"
  | "Sports"
  | "Business"
  | "Book Clubs";

export const DISCOVER_TOPICS: DiscoverTopic[] = [
  "Trending",
  "Newest",
  "Nearby",
  "Technology",
  "Neighborhood",
  "Volunteering",
  "Sports",
  "Business",
  "Book Clubs"
];

export type DiscoverCommunity = {
  id: string;
  name: string;
  topic: DiscoverTopic;
  members: number;
  blurb: string;
  place: string;
};

export const DISCOVER_COMMUNITIES: DiscoverCommunity[] = [
  {
    id: "westside-neighbors",
    name: "Westside Neighbors",
    topic: "Neighborhood",
    members: 128,
    blurb: "Mutual aid, pantry runs, and quiet check-ins.",
    place: "Westside"
  },
  {
    id: "civic-tech",
    name: "Civic Tech Circle",
    topic: "Technology",
    members: 86,
    blurb: "Builders helping local orgs with simple tools.",
    place: "Citywide"
  },
  {
    id: "weekend-volunteers",
    name: "Weekend Volunteers",
    topic: "Volunteering",
    members: 214,
    blurb: "Saturday shifts for food, parks, and rides.",
    place: "Metro"
  },
  {
    id: "riverside-sports",
    name: "Riverside Pickup",
    topic: "Sports",
    members: 64,
    blurb: "Pickup games and fair play, not rankings.",
    place: "Riverside"
  },
  {
    id: "small-business-trust",
    name: "Main Street Trust",
    topic: "Business",
    members: 41,
    blurb: "Local shops sharing verified customer care.",
    place: "Downtown"
  },
  {
    id: "evening-readers",
    name: "Evening Readers",
    topic: "Book Clubs",
    members: 33,
    blurb: "Calm monthly reads and neighborhood discussion.",
    place: "Library district"
  },
  {
    id: "new-arrivals",
    name: "New Arrivals",
    topic: "Newest",
    members: 19,
    blurb: "Recently formed group for people just joining Trueverse.",
    place: "Citywide"
  },
  {
    id: "nearby-block",
    name: "Nearby Block Watch",
    topic: "Nearby",
    members: 52,
    blurb: "Placeholder for location-aware groups.",
    place: "Nearby · coming soon"
  }
];

export const PLACEHOLDER_EVENTS = [
  {
    id: "evt-pantry",
    title: "Westside pantry run",
    place: "Westside",
    when: "This weekend"
  },
  {
    id: "evt-park",
    title: "Park cleanup morning",
    place: "Riverside",
    when: "Sunday"
  }
];

export function communitiesForTopic(topic: DiscoverTopic | "all") {
  if (topic === "all" || topic === "Trending") {
    return [...DISCOVER_COMMUNITIES].sort((a, b) => b.members - a.members);
  }
  if (topic === "Newest") {
    return DISCOVER_COMMUNITIES.filter((item) => item.topic === "Newest").concat(
      DISCOVER_COMMUNITIES.slice(0, 3)
    );
  }
  return DISCOVER_COMMUNITIES.filter((item) => item.topic === topic);
}
