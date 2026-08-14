/**
 * Passport 2.0 presentation mock — no backend, no trust mutation.
 */

import type { TrustLevel } from "@/lib/design";
import type { ReputationDimension, ReputationSnapshot } from "@/lib/reputation";

export type PassportBadgeCard = {
  id: string;
  label: string;
  description: string;
  earned: boolean;
};

export type PassportTimelineCard = {
  id: string;
  title: string;
  body: string;
  when: string;
};

export type PassportTodayGain = {
  id: string;
  label: string;
  delta?: string;
};

export type PassportEmptyStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  done?: boolean;
};

/** Proud titles shown on the identity card. Official trust bands stay unchanged. */
export const PASSPORT_TRUST_TITLES: Record<TrustLevel, string> = {
  new: "Building Trust",
  developing: "Growing Neighbor",
  established: "Trusted Neighbor",
  highly_established: "Highly Trusted Neighbor",
  exceptional: "Exceptional Neighbor"
};

export const PASSPORT_MOCK_SCORES: ReputationSnapshot = {
  overall: 71,
  dimensions: [
    {
      id: "identity",
      label: "Identity Score",
      value: 64,
      explanation: "Email confirmed. Government ID remains optional."
    },
    {
      id: "trust",
      label: "Trust Score",
      value: 78,
      explanation: "Earned from accepted positive interactions and verified real-world trust."
    },
    {
      id: "contribution",
      label: "Contribution Score",
      value: 62,
      explanation: "Help given through Trust Acts and neighborhood support."
    },
    {
      id: "reliability",
      label: "Reliability Score",
      value: 71,
      explanation: "Consistency of showing up — streaks support XP, not trust."
    },
    {
      id: "community",
      label: "Community Score",
      value: 58,
      explanation: "How often others engage with your verified contributions."
    },
    {
      id: "expertise",
      label: "Expertise Score",
      value: 54,
      explanation: "Grows with a complete profile and demonstrated skill signals."
    },
    {
      id: "safety",
      label: "Safety Score",
      value: 69,
      explanation: "A caution signal only. Trueverse does not guarantee safety."
    }
  ]
};

export const PASSPORT_MOCK_BADGES: PassportBadgeCard[] = [
  {
    id: "early-member",
    label: "Early Member",
    description: "Joined Trueverse during the public beta.",
    earned: true
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Showed up for a community help moment.",
    earned: true
  },
  {
    id: "trusted-neighbor",
    label: "Trusted Neighbor",
    description: "Received an accepted Trust Act from someone nearby.",
    earned: true
  },
  {
    id: "helpful",
    label: "Helpful",
    description: "Recognized for a clear, kind contribution.",
    earned: true
  },
  {
    id: "community-builder",
    label: "Community Builder",
    description: "Welcomed others and kept the feed constructive.",
    earned: false
  },
  {
    id: "verified-identity",
    label: "Verified Identity",
    description: "Optional government ID verification — coming soon.",
    earned: false
  }
];

export const PASSPORT_MOCK_TIMELINE: PassportTimelineCard[] = [
  {
    id: "joined",
    title: "Joined Trueverse",
    body: "Opened a portable reputation Passport and started from a New trust level.",
    when: "Day 1"
  },
  {
    id: "email",
    title: "Verified Email",
    body: "Confirmed the account through Trueverse Auth.",
    when: "Day 1"
  },
  {
    id: "profile",
    title: "Completed Profile",
    body: "Added a name, photo, and headline so people can recognize you.",
    when: "Day 2"
  },
  {
    id: "appreciation",
    title: "Received Appreciation",
    body: "A neighbor marked a moment as helpful. Social only — trust unchanged.",
    when: "Day 4"
  },
  {
    id: "volunteered",
    title: "Volunteered",
    body: "Helped at a community event. Logged as contribution, not a trust boost from XP.",
    when: "Day 6"
  },
  {
    id: "level-up",
    title: "Community Level Up",
    body: "Community Score moved after consistent, verified participation.",
    when: "This week"
  }
];

export const PASSPORT_TODAY_GAINS: PassportTodayGain[] = [
  { id: "contribution", label: "Contribution", delta: "+2" },
  { id: "community", label: "Community", delta: "+1" },
  { id: "mission", label: "Mission Completed" }
];

export const PASSPORT_EMPTY_STEPS: PassportEmptyStep[] = [
  {
    id: "complete-profile",
    title: "Complete Profile",
    description: "Add a name, photo, headline, and city so neighbors can recognize you.",
    href: "/passport#profile"
  },
  {
    id: "verify-email",
    title: "Verify Email",
    description: "Confirm your account through Trueverse Auth. Identity stays optional.",
    href: "/auth/check-email"
  },
  {
    id: "first-appreciation",
    title: "Receive First Appreciation",
    description: "A social thank-you. Appreciations never raise Trust Score.",
    href: "/community"
  },
  {
    id: "first-trust-act",
    title: "Record First Trust Act",
    description: "Verified help is how trust is earned — not XP, likes, or daily login.",
    href: "/interactions/create"
  }
];

export const PASSPORT_LOCKED_BADGES: PassportBadgeCard[] = PASSPORT_MOCK_BADGES.map(
  (badge) => ({ ...badge, earned: false })
);

export const PASSPORT_EMPTY_SCORES: ReputationSnapshot = {
  overall: 10,
  dimensions: PASSPORT_MOCK_SCORES.dimensions.map((dimension) => ({
    ...dimension,
    value: dimension.id === "identity" ? 12 : 8,
    explanation:
      dimension.id === "identity"
        ? "Verify email to start this signal. Government ID remains optional."
        : "This signal starts after your first real community moment."
  }))
};

export function withPassportEmptyProgress(
  progress: {
    completeProfile: boolean;
    emailVerified: boolean;
    appreciation: boolean;
    trustAct: boolean;
  }
): PassportEmptyStep[] {
  return PASSPORT_EMPTY_STEPS.map((step) => {
    if (step.id === "complete-profile") return { ...step, done: progress.completeProfile };
    if (step.id === "verify-email") return { ...step, done: progress.emailVerified };
    if (step.id === "first-appreciation") return { ...step, done: progress.appreciation };
    if (step.id === "first-trust-act") return { ...step, done: progress.trustAct };
    return step;
  });
}

export const REPUTATION_CARD_META: Record<
  ReputationDimension["id"],
  { icon: "shield" | "heart" | "spark" | "clock" | "users" | "star" | "alert"; bar: string }
> = {
  identity: { icon: "shield", bar: "bg-primary" },
  trust: { icon: "heart", bar: "bg-brand" },
  contribution: { icon: "spark", bar: "bg-success" },
  reliability: { icon: "clock", bar: "bg-chart-4" },
  community: { icon: "users", bar: "bg-chart-2" },
  expertise: { icon: "star", bar: "bg-xp" },
  safety: { icon: "alert", bar: "bg-warning" }
};
