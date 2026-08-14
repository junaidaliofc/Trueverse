/**
 * Sprint 3 Community mock feed.
 * Presentation-only sample content until live posts replace it.
 * Authenticated Passport / dashboard still use real profile data.
 */

import type { CommunityAuthor, CommunityPostType, CommunityPostView } from "@/lib/types";
import type { CommunityFeedTab } from "@/lib/community";

export type MockFeedTab = Extract<
  CommunityFeedTab,
  "for_you" | "following" | "nearby" | "trending"
>;

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function author(
  id: string,
  name: string,
  username: string,
  trust: number
): CommunityAuthor {
  return {
    id,
    full_name: name,
    photo_url: null,
    trust_score: trust,
    trueverse_id: `tv_${username}`,
    username
  };
}

const authors = {
  jordan: author("mock-jordan", "Jordan Hale", "jordanhale", 72),
  priya: author("mock-priya", "Priya Nair", "priyanair", 88),
  marcus: author("mock-marcus", "Marcus Chen", "marcuschen", 54),
  lena: author("mock-lena", "Lena Ortiz", "lenaortiz", 41),
  noah: author("mock-noah", "Noah Okonkwo", "noahok", 63),
  amira: author("mock-amira", "Amira Solis", "amirasolis", 79)
};

function post(options: {
  id: string;
  type: CommunityPostType;
  author: CommunityAuthor;
  title?: string;
  body: string;
  hours: number;
  image?: boolean;
  appreciate?: number;
  comments?: number;
  tabs: MockFeedTab[];
}): CommunityPostView & { tabs: MockFeedTab[] } {
  return {
    id: options.id,
    author_id: options.author.id,
    post_type: options.type,
    title: options.title ?? null,
    body: options.body,
    image_url: options.image
      ? "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=60"
      : null,
    category: options.type === "help" ? "Mutual aid" : "Neighborhood",
    location: options.tabs.includes("nearby") ? "Westside" : null,
    trust_act_id: options.type === "trust_act" ? "mock-trust-act" : null,
    is_hidden: false,
    moderation_status: "visible",
    created_at: hoursAgo(options.hours),
    updated_at: hoursAgo(options.hours),
    author: options.author,
    like_count: 0,
    appreciate_count: options.appreciate ?? 0,
    comment_count: options.comments ?? 0,
    liked_by_me: false,
    appreciated_by_me: false,
    bookmarked_by_me: false,
    tabs: options.tabs
  };
}

export const MOCK_COMMUNITY_POSTS: Array<CommunityPostView & { tabs: MockFeedTab[] }> = [
  post({
    id: "mock-1",
    type: "update",
    author: authors.jordan,
    title: "Garden beds are open again",
    body: "The west beds are unlocked this weekend. Bring extra soil if you have some — newcomers welcome.",
    hours: 1,
    image: true,
    appreciate: 18,
    comments: 4,
    tabs: ["for_you", "nearby", "trending"]
  }),
  post({
    id: "mock-2",
    type: "trust_act",
    author: authors.priya,
    title: "Recognizing Noah for the evening shuttle",
    body: "Noah coordinated safe rides home after the volunteer night. Clear communication, on time, no drama.",
    hours: 3,
    appreciate: 42,
    comments: 7,
    tabs: ["for_you", "following", "trending"]
  }),
  post({
    id: "mock-3",
    type: "help",
    author: authors.marcus,
    title: "Need two extra hands Saturday",
    body: "Looking for help moving folding tables to the community hall between 8–10am. Coffee provided.",
    hours: 5,
    appreciate: 6,
    comments: 3,
    tabs: ["for_you", "nearby"]
  }),
  post({
    id: "mock-4",
    type: "event",
    author: authors.lena,
    title: "Neighborhood walk · Sunday 7am",
    body: "Easy 3km loop starting at the library steps. All paces. No signup required.",
    hours: 8,
    image: true,
    appreciate: 21,
    comments: 5,
    tabs: ["for_you", "nearby", "trending"]
  }),
  post({
    id: "mock-5",
    type: "achievement",
    author: authors.noah,
    title: "Unlocked Helpful Neighbor",
    body: "First community badge after three accepted Trust Acts. Badges never raise trust — they just mark the journey.",
    hours: 12,
    appreciate: 31,
    comments: 9,
    tabs: ["for_you", "following", "trending"]
  }),
  post({
    id: "mock-6",
    type: "update",
    author: authors.amira,
    body: "Library study room 2 is free tonight if anyone needs a quiet place to work.",
    hours: 14,
    appreciate: 9,
    comments: 1,
    tabs: ["for_you", "following"]
  }),
  post({
    id: "mock-7",
    type: "trust_act",
    author: authors.jordan,
    title: "Thank you, Lena",
    body: "Lena covered the welcome desk when two volunteers were late. Calm, kind, and organized.",
    hours: 18,
    appreciate: 27,
    comments: 2,
    tabs: ["following", "trending"]
  }),
  post({
    id: "mock-8",
    type: "help",
    author: authors.priya,
    title: "Printer paper for the youth workshop?",
    body: "We are short about 200 sheets for Saturday. Can drop off at the rec center front desk.",
    hours: 22,
    appreciate: 4,
    comments: 6,
    tabs: ["nearby", "for_you"]
  }),
  post({
    id: "mock-9",
    type: "event",
    author: authors.marcus,
    title: "Skills share: basic bike repair",
    body: "Thursday 6pm behind the co-op. Bring a bike if you have one. Helmets on site.",
    hours: 26,
    appreciate: 15,
    comments: 4,
    tabs: ["for_you", "trending"]
  }),
  post({
    id: "mock-10",
    type: "achievement",
    author: authors.lena,
    title: "Profile complete",
    body: "Finished the Passport basics — photo, city, and headline. Next up: first Trust Act.",
    hours: 30,
    appreciate: 11,
    comments: 2,
    tabs: ["following"]
  }),
  post({
    id: "mock-11",
    type: "update",
    author: authors.noah,
    title: "Lost keys near the river path",
    body: "Blue carabiner, two house keys, one fob. If found, comment here or drop at the ranger kiosk.",
    hours: 34,
    appreciate: 8,
    comments: 3,
    tabs: ["nearby", "for_you"]
  }),
  post({
    id: "mock-12",
    type: "trust_act",
    author: authors.amira,
    title: "Marcus kept the night market safe",
    body: "Walked two first-time vendors to their cars after close. Quiet leadership.",
    hours: 40,
    appreciate: 36,
    comments: 8,
    tabs: ["for_you", "nearby", "trending"]
  }),
  post({
    id: "mock-13",
    type: "event",
    author: authors.priya,
    title: "Potluck after the river cleanup",
    body: "Bring one dish if you can. Tables go up at 5pm near the boat house.",
    hours: 44,
    appreciate: 13,
    comments: 4,
    tabs: ["for_you", "nearby"]
  })
];

export const MOCK_SPONSORED = {
  id: "sponsored-mock",
  advertiser: "Trueverse Labs",
  title: "Build reputation in public",
  body: "Placeholder sponsored placement. Real ads will be labeled, distinguishable, and never mixed into Trust Score."
};

export function mockPostsForTab(tab: MockFeedTab): CommunityPostView[] {
  return MOCK_COMMUNITY_POSTS.filter((item) => item.tabs.includes(tab)).map((item) => ({
    id: item.id,
    author_id: item.author_id,
    post_type: item.post_type,
    title: item.title,
    body: item.body,
    image_url: item.image_url,
    category: item.category,
    location: item.location,
    trust_act_id: item.trust_act_id,
    is_hidden: item.is_hidden,
    moderation_status: item.moderation_status,
    created_at: item.created_at,
    updated_at: item.updated_at,
    author: item.author,
    like_count: item.like_count,
    appreciate_count: item.appreciate_count,
    comment_count: item.comment_count,
    liked_by_me: item.liked_by_me,
    appreciated_by_me: item.appreciated_by_me,
    bookmarked_by_me: item.bookmarked_by_me
  }));
}
