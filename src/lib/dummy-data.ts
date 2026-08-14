import type { AdminReport, HelpRequest, PositiveInteraction, Profile } from "@/lib/types";
import {
  scoreToTrustLevel,
  toPassportDna,
  type PassportPrivacy,
  type PassportStats,
  type ReputationDna,
  type TrustLevel,
  type VerificationItem
} from "@/lib/design";
import type { StreakState, XpUnlock } from "@/lib/xp-engine";
import { xpToLevel } from "@/lib/xp-engine";

export type Mission = {
  id: string;
  title: string;
  description: string;
  cadence: "daily" | "weekly";
  xp_reward: number;
  progress: number;
  target: number;
  completed: boolean;
  href?: string;
};

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
  username: "ariamorgan",
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

export const passportDna = toPassportDna(currentUserReputation.dna);

export const passportVerifications: VerificationItem[] = [
  {
    kind: "email",
    label: "Email",
    status: "verified",
    completed_at: "2026-01-12T10:05:00Z",
    detail: "aria@trueverse.app"
  },
  {
    kind: "phone",
    label: "Phone",
    status: "pending",
    completed_at: null,
    detail: "Verification in progress"
  },
  {
    kind: "identity",
    label: "Identity",
    status: "verified",
    completed_at: "2026-06-18T12:00:00Z",
    detail: "Government ID verified"
  },
  {
    kind: "professional",
    label: "Professional",
    status: "unverified",
    completed_at: null,
    detail: "Add workplace or credential"
  },
  {
    kind: "community",
    label: "Community",
    status: "verified",
    completed_at: "2026-05-02T09:00:00Z",
    detail: "Neighborhood mutual-aid circle"
  },
  {
    kind: "organization",
    label: "Organization",
    status: "unverified",
    completed_at: null,
    detail: "No organization link yet"
  }
];

export const passportStats: PassportStats = {
  trustActs: 127,
  uniqueContributors: 46,
  references: 8,
  yearsActive: 0.5,
  appreciationsReceived: 98,
  missionsCompleted: 34
};

export const passportPrivacy: PassportPrivacy = {
  showDna: false,
  showVerifications: true,
  showBadges: true,
  showTimeline: true,
  showStatistics: true
};

export const passportProfileCompletion = 72;

export function getPassportXpLevel(totalXp = userXp.total_xp) {
  return xpToLevel(totalXp).level;
}

/** Build a Passport view model for owner or public surfaces. */
export function buildPassportViewModel(
  profile: Profile,
  options?: {
    mode?: "owner" | "public";
    privacy?: PassportPrivacy;
  }
) {
  const isCurrent = profile.id === currentUser.id;
  const trustIndex = isCurrent
    ? currentUserReputation.trustIndex
    : profile.trust_score;
  const identityVerified = isCurrent
    ? currentUserReputation.identityVerified
    : profile.trust_score >= 50;
  const dna = isCurrent
    ? passportDna
    : toPassportDna({
        helping: Math.min(100, trustIndex + 20),
        reliability: Math.min(100, trustIndex + 8),
        communication: Math.min(100, trustIndex + 12),
        professionalism: Math.max(0, Math.min(100, trustIndex - 5)),
        safety: Math.min(100, trustIndex + 5),
        community: Math.min(100, trustIndex + 10),
        leadership: Math.max(20, Math.min(100, trustIndex - 10))
      });

  const years =
    Math.round(
      ((Date.now() - new Date(profile.created_at).getTime()) /
        (365.25 * 24 * 60 * 60 * 1000)) *
        10
    ) / 10;

  const stats: PassportStats = isCurrent
    ? passportStats
    : {
        trustActs: Math.round(trustIndex * 1.8),
        uniqueContributors: Math.round(trustIndex * 0.7),
        references: Math.max(1, Math.round(trustIndex / 12)),
        yearsActive: Math.max(0.1, years),
        appreciationsReceived: Math.round(trustIndex * 1.2),
        missionsCompleted: Math.round(trustIndex / 2)
      };

  const verifications: VerificationItem[] = isCurrent
    ? passportVerifications
    : [
        {
          kind: "email",
          label: "Email",
          status: "verified",
          completed_at: profile.created_at,
          detail: "Verified"
        },
        {
          kind: "phone",
          label: "Phone",
          status: "unverified",
          completed_at: null
        },
        {
          kind: "identity",
          label: "Identity",
          status: identityVerified ? "verified" : "unverified",
          completed_at: identityVerified ? profile.updated_at : null,
          detail: identityVerified ? "Government ID verified" : undefined
        },
        {
          kind: "professional",
          label: "Professional",
          status: "unverified",
          completed_at: null
        },
        {
          kind: "community",
          label: "Community",
          status: trustIndex >= 40 ? "verified" : "unverified",
          completed_at: trustIndex >= 40 ? profile.updated_at : null,
          detail: trustIndex >= 40 ? "Community participation verified" : undefined
        },
        {
          kind: "organization",
          label: "Organization",
          status: "unverified",
          completed_at: null
        }
      ];

  const username = profile.trueverse_id.replace(/^tv_/, "").toLowerCase();
  const sharePath = `/u/${username}`;
  const mode = options?.mode ?? "owner";
  const privacy = options?.privacy ?? passportPrivacy;

  const timelineSource = isCurrent
    ? profileTimeline
    : profileTimeline.slice(0, 2).map((event, i) => ({
        ...event,
        id: `${profile.id}-tl-${i}`,
        actor_name: profile.full_name
      }));

  const passportBadges = isCurrent
    ? badges
    : badges.map((badge, i) => ({
        ...badge,
        earned: i < 3,
        earned_at: i < 3 ? badge.earned_at ?? profile.updated_at.slice(0, 10) : undefined
      }));

  const totalXp = isCurrent ? userXp.total_xp : Math.round(trustIndex * 18);
  const xpLevel = xpToLevel(totalXp).level;

  const view = {
    profile,
    username,
    displayName: profile.full_name,
    trueverseId: profile.trueverse_id,
    trustIndex,
    trustLevel: scoreToTrustLevel(trustIndex),
    identityVerified,
    xpLevel,
    totalXp,
    profileCompletion: isCurrent
      ? passportProfileCompletion
      : Math.min(100, 40 + Math.round(trustIndex / 2)),
    dna,
    verifications:
      mode === "public"
        ? verifications.map((item) =>
            item.kind === "email" || item.kind === "phone"
              ? {
                  ...item,
                  detail:
                    item.status === "verified"
                      ? "Verified"
                      : item.status === "pending"
                        ? "In progress"
                        : undefined
                }
              : item
          )
        : verifications,
    badges: passportBadges,
    timeline: timelineSource.map((event) => {
      let kind: "trust_act" | "achievement" | "verification" | "contribution" | "mission" =
        "contribution";
      if (event.type === "help") kind = "trust_act";
      else if (event.type === "badge" || event.type === "streak" || event.type === "xp")
        kind = "achievement";
      else if (event.type === "identity") kind = "verification";
      else if (event.type === "mission") kind = "mission";
      else if (event.type === "appreciation") kind = "contribution";
      return {
        id: event.id,
        kind,
        title: event.title,
        body: event.body,
        created_at: event.created_at,
        actor_name: event.actor_name,
        meta: event.meta
      };
    }),
    stats,
    privacy,
    sharePath,
    bio: profile.bio
  };

  if (mode === "public") {
    return {
      ...view,
      dna: privacy.showDna ? view.dna : {
        helping: 0,
        reliability: 0,
        integrity: 0,
        community: 0,
        leadership: 0
      },
      badges: privacy.showBadges ? view.badges : [],
      timeline: privacy.showTimeline ? view.timeline : [],
      stats: privacy.showStatistics ? view.stats : view.stats
    };
  }

  return view;
}

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
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop",
    bio: "Regular blood donor and campus safety course facilitator. Building portable trust through verified community work.",
    trust_score: 89,
    streak: 33,
    trueverse_id: "tv_sarahkim",
    username: "sarahkim",
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

export const userStreaks: StreakState = {
  daily: 14,
  weekly: 3,
  monthly: 2,
  lastActiveDate: "2026-06-25"
};

/** Daily missions — habit loop. Rewards are XP only. */
export const dailyMissions: Mission[] = [
  {
    id: "daily-profile",
    title: "Complete profile",
    description: "Add a photo, name, and bio on your Passport.",
    cadence: "daily",
    xp_reward: 30,
    progress: 0,
    target: 1,
    completed: false,
    href: "/profile"
  },
  {
    id: "daily-appreciate",
    title: "Appreciate someone",
    description: "Thank a neighbor on a community post. Appreciation never changes Trust.",
    cadence: "daily",
    xp_reward: 25,
    progress: 0,
    target: 1,
    completed: false,
    href: "/community"
  },
  {
    id: "daily-help",
    title: "Help someone",
    description: "Record a Trust Act for real help you gave or received.",
    cadence: "daily",
    xp_reward: 40,
    progress: 0,
    target: 1,
    completed: false,
    href: "/interactions/create"
  },
  {
    id: "daily-reply",
    title: "Reply to a discussion",
    description: "Leave a useful reply on a community thread.",
    cadence: "daily",
    xp_reward: 20,
    progress: 0,
    target: 1,
    completed: false,
    href: "/community"
  },
  {
    id: "daily-join",
    title: "Join a community",
    description: "Find a group that matches how you show up.",
    cadence: "daily",
    xp_reward: 25,
    progress: 0,
    target: 1,
    completed: false,
    href: "/community/discover"
  },
  {
    id: "daily-streak",
    title: "Maintain streak",
    description: "Check in today so your XP streak stays intact. Streaks never raise Trust.",
    cadence: "daily",
    xp_reward: 15,
    progress: 0,
    target: 1,
    completed: false,
    href: "/dashboard"
  }
];

export const xpUnlockCatalog: XpUnlock[] = [
  {
    id: "u-level-5",
    kind: "level",
    title: "Level 5",
    description: "A warmer profile glow animation.",
    requiredLevel: 5,
    unlocked: true
  },
  {
    id: "u-badge-helper",
    kind: "badge",
    title: "Community Helper",
    description: "Badge for consistent verified help.",
    requiredLevel: 5,
    requiredXp: 1200,
    unlocked: true
  },
  {
    id: "u-theme-dawn",
    kind: "theme",
    title: "Dawn Theme",
    description: "Soft sunrise profile theme.",
    requiredLevel: 6,
    unlocked: false
  },
  {
    id: "u-deco-ring",
    kind: "decoration",
    title: "Verdant Ring",
    description: "Decorative avatar ring.",
    requiredLevel: 6,
    unlocked: false
  },
  {
    id: "u-anim-streak",
    kind: "animation",
    title: "Streak Flame",
    description: "Animated streak celebration.",
    requiredLevel: 4,
    unlocked: true
  },
  {
    id: "u-badge-neighbor",
    kind: "badge",
    title: "Reliable Neighbor",
    description: "Upcoming badge for local consistency.",
    requiredLevel: 7,
    unlocked: false
  }
];

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

export type ActivityCommentItem = {
  id: string;
  activity_id: string;
  author_id: string;
  author_name: string;
  author_trueverse_id: string;
  body: string;
  created_at: string;
};

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
  comment_items?: ActivityCommentItem[];
};

/** Profile IDs the current user follows (social graph — not a trust signal). */
export const followingIds = ["user-maya", "user-sarah", "user-ahmed"];

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
    comments: 2,
    comment_items: [
      {
        id: "c-1",
        activity_id: "act-1",
        author_id: "user-maya",
        author_name: "Maya Chen",
        author_trueverse_id: "tv_mayachen",
        body: "This is what community looks like. Grateful for people like Ahmed.",
        created_at: "2026-06-25T14:40:00Z"
      },
      {
        id: "c-2",
        activity_id: "act-1",
        author_id: "user-aria",
        author_name: "Aria Morgan",
        author_trueverse_id: "tv_ariamorgan",
        body: "Appreciating this — reliable and kind.",
        created_at: "2026-06-25T15:10:00Z"
      }
    ]
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
    comments: 1,
    appreciated_by_me: true,
    comment_items: [
      {
        id: "c-3",
        activity_id: "act-2",
        author_id: "user-omar",
        author_name: "Omar Patel",
        author_trueverse_id: "tv_omarpatel",
        body: "Inspiring — booking my next donation.",
        created_at: "2026-06-25T12:05:00Z"
      }
    ]
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
    comments: 1,
    comment_items: [
      {
        id: "c-4",
        activity_id: "act-3",
        author_id: "user-sarah",
        author_name: "Sarah Kim",
        author_trueverse_id: "tv_sarahkim",
        body: "Century club! Your consistency lifts the whole neighborhood.",
        created_at: "2026-06-24T20:30:00Z"
      }
    ]
  },
  {
    id: "act-4",
    actor_id: "user-omar",
    actor_name: "Omar Patel",
    actor_trueverse_id: "tv_omarpatel",
    type: "badge",
    title: "Omar earned Community Leader",
    body: "Badge awarded for organizing pantry volunteers this month. XP/cosmetic recognition — not a trust change.",
    created_at: "2026-06-24T16:10:00Z",
    appreciations: 18,
    comments: 0,
    comment_items: []
  }
];

export const peopleToFollow = profiles.filter(
  (profile) => profile.id !== currentUser.id && !followingIds.includes(profile.id)
);

export const missions: Mission[] = [
  ...dailyMissions,
  {
    id: "m-verify-email",
    title: "Verify email",
    description: "Confirm your email to secure your account.",
    cadence: "weekly",
    xp_reward: 40,
    progress: 1,
    target: 1,
    completed: true,
    href: "/passport"
  },
  {
    id: "m-trust-act",
    title: "Finish one Trust Act",
    description: "Complete a verified interaction this week.",
    cadence: "weekly",
    xp_reward: 60,
    progress: 0,
    target: 1,
    completed: false,
    href: "/interactions/create"
  },
  {
    id: "m-volunteer",
    title: "Volunteer once this week",
    description: "Log a verified volunteer action.",
    cadence: "weekly",
    xp_reward: 80,
    progress: 0,
    target: 1,
    completed: false,
    href: "/community"
  }
];

export type TimelineEvent = {
  id: string;
  type: "help" | "appreciation" | "badge" | "streak" | "identity" | "mission" | "xp";
  title: string;
  body: string;
  created_at: string;
  actor_name?: string;
  meta?: string;
};

export const profileTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    type: "help",
    title: "Aria helped Maya after a community event",
    body: "Coordinated safe rides home for three volunteers.",
    created_at: "2026-06-24T18:20:00Z",
    actor_name: "Aria Morgan",
    meta: "Trust Act"
  },
  {
    id: "tl-2",
    type: "appreciation",
    title: "Sarah appreciated your Trust Act",
    body: "“Clear communication and showed up exactly on time.”",
    created_at: "2026-06-25T10:15:00Z",
    actor_name: "Sarah Kim",
    meta: "+25 XP"
  },
  {
    id: "tl-3",
    type: "badge",
    title: "You earned Community Helper",
    body: "Unlocked through consistent verified help — an XP reward, not a trust change.",
    created_at: "2026-06-23T16:00:00Z",
    meta: "Badge"
  },
  {
    id: "tl-4",
    type: "streak",
    title: "Completed 7-day streak",
    body: "Daily presence celebrated. Streaks never increase trust.",
    created_at: "2026-06-22T08:00:00Z",
    meta: "Streak"
  },
  {
    id: "tl-5",
    type: "identity",
    title: "Identity verified",
    body: "A verified identity signal is now visible on your public profile.",
    created_at: "2026-06-18T12:00:00Z",
    meta: "Verified"
  },
  {
    id: "tl-6",
    type: "mission",
    title: "Mission completed",
    body: "Appreciate someone — daily mission cleared.",
    created_at: "2026-06-17T19:30:00Z",
    meta: "+25 XP"
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
  progress?: number;
  target?: number;
};

export const achievements: Achievement[] = [
  { id: "a-first-act", name: "First Trust Act", description: "Complete your first verified interaction.", unlocked: true },
  { id: "a-10-appreciations", name: "10 Appreciations", description: "Receive 10 appreciations from the community.", unlocked: true, progress: 10, target: 10 },
  { id: "a-100-xp", name: "100 XP", description: "Earn your first 100 experience points.", unlocked: true },
  { id: "a-helper", name: "Community Helper", description: "Help people consistently in your community.", unlocked: true },
  { id: "a-neighbor", name: "Reliable Neighbor", description: "Build a local reputation for follow-through.", unlocked: false, progress: 4, target: 8 },
  { id: "a-mentor", name: "Mentor", description: "Guide newcomers through their first Trust Acts.", unlocked: false, progress: 1, target: 3 },
  { id: "a-volunteer", name: "Volunteer", description: "Log verified volunteer contributions.", unlocked: true },
  { id: "a-identity", name: "Verified Identity", description: "Complete identity verification.", unlocked: true }
];

export type NotificationType =
  | "appreciation"
  | "mission"
  | "trust"
  | "badge"
  | "recap"
  | "streak"
  | "xp";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "appreciation",
    title: "Someone appreciated you",
    body: "Maya appreciated your ride coordination.",
    created_at: "2026-06-25T18:00:00Z",
    read: false
  },
  {
    id: "n2",
    type: "mission",
    title: "Mission completed",
    body: "Appreciate someone — +25 XP",
    created_at: "2026-06-25T11:00:00Z",
    read: false
  },
  {
    id: "n3",
    type: "badge",
    title: "Badge unlocked",
    body: "Community Helper is now on your profile.",
    created_at: "2026-06-24T12:00:00Z",
    read: false
  },
  {
    id: "n4",
    type: "trust",
    title: "Trust level changed",
    body: "Your trust level is now Established.",
    created_at: "2026-06-20T09:00:00Z",
    read: true
  },
  {
    id: "n5",
    type: "streak",
    title: "Streak milestone",
    body: "14-day streak is alive. Keep showing up.",
    created_at: "2026-06-25T08:05:00Z",
    read: true
  },
  {
    id: "n6",
    type: "recap",
    title: "Weekly recap",
    body: "You earned 240 XP and received 12 appreciations this week.",
    created_at: "2026-06-22T09:00:00Z",
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
