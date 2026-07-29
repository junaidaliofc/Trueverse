import type { AdminReport, HelpRequest, PositiveInteraction, Profile } from "@/lib/types";
import {
  scoreToTrustLevel,
  type ReputationDna,
  type TrustLevel
} from "@/lib/design";

/** Public trust index is 0–100. Dummy profiles use this scale for UI. */
export const currentUser: Profile = {
  id: "user-aria",
  email: "aria@trueverse.app",
  full_name: "Aria Morgan",
  photo_url: null,
  bio: "Neighborhood organizer, volunteer driver, and mutual-aid coordinator. I use Trueverse to build accountable local trust.",
  trust_score: 58,
  streak: 14,
  trueverse_id: "tv_ariamorgan",
  role: "member",
  is_disabled: false,
  last_positive_at: "2026-06-24T18:20:00Z",
  created_at: "2026-01-12T10:00:00Z",
  updated_at: "2026-06-24T18:20:00Z"
};

export const currentUserReputation = {
  trustIndex: 58,
  identityVerified: true,
  trustActs: 127,
  appreciations: 98,
  communityRank: "Top 8%",
  dna: {
    helping: 88,
    reliability: 72,
    communication: 81,
    professionalism: 64,
    safety: 70,
    community: 76,
    leadership: 54
  } satisfies ReputationDna
};

export const profiles: Profile[] = [
  currentUser,
  {
    id: "user-maya",
    email: "maya@example.com",
    full_name: "Maya Chen",
    photo_url: null,
    bio: "Community responder helping neighbors with errands, translation, and late-night check-ins.",
    trust_score: 72,
    streak: 27,
    trueverse_id: "tv_mayachen",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-25T07:30:00Z",
    created_at: "2025-12-02T09:00:00Z",
    updated_at: "2026-06-25T07:30:00Z"
  },
  {
    id: "user-omar",
    email: "omar@example.com",
    full_name: "Omar Patel",
    photo_url: null,
    bio: "Repair volunteer and weekend food pantry coordinator.",
    trust_score: 48,
    streak: 8,
    trueverse_id: "tv_omarpatel",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-23T12:15:00Z",
    created_at: "2026-02-18T12:00:00Z",
    updated_at: "2026-06-23T12:15:00Z"
  },
  {
    id: "user-lena",
    email: "lena@example.com",
    full_name: "Lena Brooks",
    photo_url: null,
    bio: "Admin reviewer focused on fair evidence review and dispute resolution.",
    trust_score: 68,
    streak: 19,
    trueverse_id: "tv_lenabrooks",
    role: "admin",
    is_disabled: false,
    last_positive_at: "2026-06-22T14:45:00Z",
    created_at: "2025-11-20T08:30:00Z",
    updated_at: "2026-06-22T14:45:00Z"
  },
  {
    id: "user-ahmed",
    email: "ahmed@example.com",
    full_name: "Ahmed Hassan",
    photo_url: null,
    bio: "Student mentor and weekend mover for new neighbors.",
    trust_score: 61,
    streak: 21,
    trueverse_id: "tv_ahmedhassan",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-25T09:00:00Z",
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2026-06-25T09:00:00Z"
  },
  {
    id: "user-sarah",
    email: "sarah@example.com",
    full_name: "Sarah Kim",
    photo_url: null,
    bio: "Regular blood donor and campus safety course facilitator.",
    trust_score: 89,
    streak: 33,
    trueverse_id: "tv_sarahkim",
    role: "member",
    is_disabled: false,
    last_positive_at: "2026-06-24T11:00:00Z",
    created_at: "2025-08-14T08:00:00Z",
    updated_at: "2026-06-24T11:00:00Z"
  }
];

export function getProfileTrustLevel(profile: Profile): TrustLevel {
  return scoreToTrustLevel(profile.trust_score);
}

export const userXp = {
  profile_id: currentUser.id,
  total_xp: 1280,
  daily_streak: 14,
  weekly_xp: 240,
  weekly_goal: 400
};

/** XP never increases trust — cosmetics / badges / themes / achievements only. */
export const XP_UNLOCK_NOTE =
  "XP unlocks cosmetics, badges, themes, and achievements. XP never increases trust.";

export const interactions: PositiveInteraction[] = [
  {
    id: "interaction-ride-home",
    author_id: "user-aria",
    recipient_id: "user-maya",
    title: "Safe ride after community event",
    description:
      "Aria coordinated rides for three volunteers after the mutual-aid meetup and confirmed everyone arrived safely.",
    status: "accepted",
    accepted_at: "2026-06-24T18:20:00Z",
    rejected_at: null,
    expires_at: "2026-07-08T18:20:00Z",
    created_at: "2026-06-24T17:05:00Z",
    updated_at: "2026-06-24T18:20:00Z"
  },
  {
    id: "interaction-grocery-run",
    author_id: "user-omar",
    recipient_id: "user-aria",
    title: "Delivered groceries to an elder",
    description:
      "Omar completed a grocery run during heavy rain and sent a clear receipt and delivery confirmation.",
    status: "pending",
    accepted_at: null,
    rejected_at: null,
    expires_at: "2026-07-03T16:00:00Z",
    created_at: "2026-06-25T16:00:00Z",
    updated_at: "2026-06-25T16:00:00Z"
  },
  {
    id: "interaction-tool-return",
    author_id: "user-maya",
    recipient_id: "user-omar",
    title: "Returned borrowed repair tools",
    description:
      "Maya returned a borrowed drill kit on time, cleaned, and with replacement bits included.",
    status: "accepted",
    accepted_at: "2026-06-23T12:15:00Z",
    rejected_at: null,
    expires_at: "2026-07-07T12:15:00Z",
    created_at: "2026-06-23T11:25:00Z",
    updated_at: "2026-06-23T12:15:00Z"
  }
];

export const helpRequests: HelpRequest[] = [
  {
    id: "request-pantries",
    author_id: "user-maya",
    title: "Need two volunteers for pantry sorting",
    description:
      "Looking for trusted helpers to sort produce boxes before Saturday distribution. Gloves and instructions provided.",
    location: "Mission District",
    is_open: true,
    created_at: "2026-06-25T08:00:00Z",
    updated_at: "2026-06-25T08:00:00Z",
    closed_at: null,
    profiles: {
      full_name: "Maya Chen",
      photo_url: null,
      trust_score: 72,
      trueverse_id: "tv_mayachen"
    },
    community_responses: [
      {
        id: "response-1",
        request_id: "request-pantries",
        author_id: "user-omar",
        message: "I can take the early shift and bring extra crates.",
        is_hidden: false,
        created_at: "2026-06-25T09:10:00Z",
        profiles: {
          full_name: "Omar Patel",
          photo_url: null,
          trust_score: 48,
          trueverse_id: "tv_omarpatel"
        }
      }
    ]
  },
  {
    id: "request-translate",
    author_id: "user-ahmed",
    title: "Arabic–English translation for clinic intake",
    description: "Need a volunteer for Thursday afternoon clinic intake forms.",
    location: "Sunset",
    is_open: true,
    created_at: "2026-06-24T15:00:00Z",
    updated_at: "2026-06-24T15:00:00Z",
    closed_at: null,
    profiles: {
      full_name: "Ahmed Hassan",
      photo_url: null,
      trust_score: 61,
      trueverse_id: "tv_ahmedhassan"
    },
    community_responses: []
  }
];

export const adminReports: AdminReport[] = [
  {
    id: "report-late-return",
    reporter_id: "user-maya",
    reported_user_id: "user-omar",
    title: "Borrowed tools returned damaged",
    description:
      "Tools were returned with a cracked case and missing charger. Photos and chat logs attached as evidence.",
    evidence_url: "https://example.com/evidence/tools",
    status: "pending",
    reviewed_by: null,
    admin_notes: null,
    reviewed_at: null,
    created_at: "2026-06-22T10:00:00Z",
    updated_at: "2026-06-22T10:00:00Z",
    reporter: {
      full_name: "Maya Chen",
      trueverse_id: "tv_mayachen",
      trust_score: 72
    },
    reported_user: {
      full_name: "Omar Patel",
      trueverse_id: "tv_omarpatel",
      trust_score: 48
    }
  }
];

export const dashboardMetrics = [
  { label: "Trust level", value: "Established", detail: "Verified interaction history" },
  { label: "Current streak", value: "14", detail: "days of engagement" },
  { label: "Weekly XP", value: "240 / 400", detail: "60% of weekly goal" },
  { label: "Community rank", value: "Top 8%", detail: "local network" }
];

export const trustTimeline = [
  { title: "Positive interaction accepted", delta: "+3", date: "Today", tone: "positive" as const },
  { title: "Help request response", delta: "0", date: "Yesterday", tone: "neutral" as const },
  { title: "Report dismissed after review", delta: "0", date: "Jun 21", tone: "neutral" as const },
  { title: "Positive interaction accepted", delta: "+3", date: "Jun 19", tone: "positive" as const }
];

export type ActivityItem = {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_trueverse_id: string;
  type: "help" | "donation" | "milestone" | "badge" | "appreciation";
  title: string;
  body: string;
  created_at: string;
  appreciations: number;
  comments: number;
  appreciated_by_me?: boolean;
};

export const activities: ActivityItem[] = [
  {
    id: "act-1",
    actor_id: "user-ahmed",
    actor_name: "Ahmed Hassan",
    actor_trueverse_id: "tv_ahmedhassan",
    type: "help",
    title: "Ahmed helped a student move",
    body: "Verified help moving boxes into a new apartment near campus.",
    created_at: "2026-06-25T14:00:00Z",
    appreciations: 24,
    comments: 5
  },
  {
    id: "act-2",
    actor_id: "user-sarah",
    actor_name: "Sarah Kim",
    actor_trueverse_id: "tv_sarahkim",
    type: "donation",
    title: "Sarah donated blood",
    body: "Completed a verified blood donation at the city center drive.",
    created_at: "2026-06-25T11:30:00Z",
    appreciations: 41,
    comments: 8
  },
  {
    id: "act-3",
    actor_id: "user-maya",
    actor_name: "Maya Chen",
    actor_trueverse_id: "tv_mayachen",
    type: "milestone",
    title: "Maya completed 100 verified interactions",
    body: "A community milestone unlocked after sustained verified help.",
    created_at: "2026-06-24T20:00:00Z",
    appreciations: 67,
    comments: 12
  },
  {
    id: "act-4",
    actor_id: "user-omar",
    actor_name: "Omar Patel",
    actor_trueverse_id: "tv_omarpatel",
    type: "badge",
    title: "Omar earned Community Leader",
    body: "Badge awarded for organizing pantry volunteers this month.",
    created_at: "2026-06-24T16:10:00Z",
    appreciations: 18,
    comments: 3
  }
];

export type Mission = {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly";
  xp_reward: number;
  progress: number;
  target: number;
  completed: boolean;
};

export const missions: Mission[] = [
  {
    id: "m-help",
    title: "Help one person",
    description: "Complete or verify one real-world help action.",
    cadence: "daily",
    xp_reward: 40,
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: "m-profile",
    title: "Complete your profile",
    description: "Add a photo, bio, and cover image.",
    cadence: "daily",
    xp_reward: 25,
    progress: 2,
    target: 3,
    completed: false
  },
  {
    id: "m-appreciate",
    title: "Receive an appreciation",
    description: "Earn appreciation on a shared activity.",
    cadence: "daily",
    xp_reward: 30,
    progress: 1,
    target: 1,
    completed: true
  },
  {
    id: "m-verify",
    title: "Verify identity",
    description: "Complete identity verification for stronger trust signals.",
    cadence: "weekly",
    xp_reward: 120,
    progress: 0,
    target: 1,
    completed: false
  },
  {
    id: "m-volunteer",
    title: "Volunteer once this week",
    description: "Log a verified volunteer action.",
    cadence: "weekly",
    xp_reward: 80,
    progress: 0,
    target: 1,
    completed: false
  }
];

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earned_at?: string;
};

export const badges: BadgeDef[] = [
  { id: "b-neighbor", name: "Helpful Neighbor", description: "Helped neighbors in your area.", earned: true, earned_at: "2026-05-01" },
  { id: "b-seller", name: "Reliable Seller", description: "Completed verified marketplace interactions.", earned: false },
  { id: "b-blood", name: "Blood Donor", description: "Verified blood donation.", earned: true, earned_at: "2026-04-12" },
  { id: "b-leader", name: "Community Leader", description: "Organized community missions.", earned: false },
  { id: "b-volunteer", name: "Volunteer", description: "Logged verified volunteer hours.", earned: true, earned_at: "2026-03-20" },
  { id: "b-mentor", name: "Mentor", description: "Supported learners or newcomers.", earned: false },
  { id: "b-pro", name: "Verified Professional", description: "Identity and professional verification.", earned: false },
  { id: "b-driver", name: "Safe Driver", description: "Verified safe ride contributions.", earned: true, earned_at: "2026-06-10" },
  { id: "b-early", name: "Early Member", description: "Joined Trueverse in the early cohort.", earned: true, earned_at: "2026-01-12" },
  { id: "b-top", name: "Top Contributor", description: "Top 10% community contribution this month.", earned: false }
];

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export const achievements: Achievement[] = [
  { id: "a-first", name: "First Verified Help", description: "Complete your first accepted interaction.", unlocked: true },
  { id: "a-streak7", name: "Week of Presence", description: "Maintain a 7-day XP streak.", unlocked: true },
  { id: "a-100", name: "Century of Trust", description: "Reach 100 verified interactions.", unlocked: false },
  { id: "a-referral", name: "Trusted Invite", description: "Refer a friend who verifies.", unlocked: false }
];

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "appreciation",
    title: "Someone appreciated your help",
    body: "Maya appreciated your ride coordination.",
    created_at: "2026-06-25T18:00:00Z",
    read: false
  },
  {
    id: "n2",
    type: "badge",
    title: "You earned a badge",
    body: "Safe Driver was added to your profile.",
    created_at: "2026-06-24T12:00:00Z",
    read: false
  },
  {
    id: "n3",
    type: "mission",
    title: "Mission completed",
    body: "Receive an appreciation — +30 XP",
    created_at: "2026-06-24T11:00:00Z",
    read: true
  },
  {
    id: "n4",
    type: "trust",
    title: "Trust level updated",
    body: "Your trust level is now Established.",
    created_at: "2026-06-20T09:00:00Z",
    read: true
  },
  {
    id: "n5",
    type: "friend",
    title: "Friend joined",
    body: "Ahmed Hassan joined Trueverse.",
    created_at: "2026-06-18T16:00:00Z",
    read: true
  }
];

export const leaderboards = {
  city: [
    { rank: 1, name: "Sarah Kim", id: "tv_sarahkim", score: 980 },
    { rank: 2, name: "Maya Chen", id: "tv_mayachen", score: 910 },
    { rank: 3, name: "Ahmed Hassan", id: "tv_ahmedhassan", score: 870 },
    { rank: 4, name: "Aria Morgan", id: "tv_ariamorgan", score: 820 },
    { rank: 5, name: "Omar Patel", id: "tv_omarpatel", score: 760 }
  ],
  weekly: [
    { rank: 1, name: "Ahmed Hassan", id: "tv_ahmedhassan", score: 240 },
    { rank: 2, name: "Aria Morgan", id: "tv_ariamorgan", score: 210 },
    { rank: 3, name: "Sarah Kim", id: "tv_sarahkim", score: 190 }
  ]
};

export const weeklyInsights = {
  trust_delta: "+1 level signal",
  most_appreciated: "Safe ride after community event",
  profile_suggestion: "Add a cover image and complete identity verification.",
  recommended_mission: "Help one person",
  community_impact: "Your activities received 42 appreciations this week."
};

export const suggestedPeople = profiles.filter((p) => p.id !== currentUser.id).slice(0, 4);
