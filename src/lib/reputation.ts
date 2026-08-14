/**
 * Sprint 3 reputation dashboard — presentation layer only.
 * Scores are derived from existing profile trust/XP signals until a dedicated
 * reputation engine ships. XP never increases trust.
 */

import type { Profile } from "@/lib/types";

type ReputationProfile = Profile & {
  trust_index?: number | null;
  identity_verified?: boolean | null;
  trust_acts?: number | null;
  appreciations_count?: number | null;
};

function profileTrustIndex(profile: ReputationProfile) {
  if (typeof profile.trust_index === "number") {
    return Math.max(0, Math.min(100, profile.trust_index));
  }
  if (typeof profile.trust_score === "number" && profile.trust_score > 100) {
    return Math.max(0, Math.min(100, Math.round(profile.trust_score / 10)));
  }
  if (typeof profile.trust_score === "number") {
    return Math.max(0, Math.min(100, profile.trust_score));
  }
  return 15;
}

export type ReputationDimensionId =
  | "identity"
  | "trust"
  | "contribution"
  | "expertise"
  | "community"
  | "reliability"
  | "safety";

export type ReputationDimension = {
  id: ReputationDimensionId;
  label: string;
  value: number;
  explanation: string;
};

export type ReputationSnapshot = {
  overall: number;
  dimensions: ReputationDimension[];
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Map existing profile fields into the seven-dimension dashboard.
 * Not a live reputation engine — values stay conservative and empty-safe.
 */
export function buildReputationSnapshot(
  profile: ReputationProfile,
  options?: { emailVerified?: boolean; totalXp?: number }
): ReputationSnapshot {
  const trust = profileTrustIndex(profile);
  const emailVerified = Boolean(options?.emailVerified);
  const identityFlag = Boolean(profile.identity_verified);
  const totalXp = options?.totalXp ?? 0;

  const identity = clampScore(
    (emailVerified ? 45 : 12) + (identityFlag ? 40 : 0) + (profile.photo_url ? 10 : 0)
  );
  const contribution = clampScore((profile.trust_acts ?? 0) * 8 + Math.min(20, totalXp / 80));
  const expertise = clampScore(
    (profile.headline ? 18 : 4) + (profile.bio ? 12 : 0) + Math.min(40, totalXp / 50)
  );
  const community = clampScore((profile.appreciations_count ?? 0) * 4);
  const reliability = clampScore(trust * 0.55 + (profile.streak ? Math.min(20, profile.streak) : 0));
  const safety = clampScore(identity * 0.35 + trust * 0.4 + (emailVerified ? 12 : 0));

  const dimensions: ReputationDimension[] = [
    {
      id: "identity",
      label: "Identity Score",
      value: identity,
      explanation: "Built from verified email and optional identity checks — never assumed."
    },
    {
      id: "trust",
      label: "Trust Score",
      value: trust,
      explanation:
        "Earned from accepted positive interactions and verified real-world trust."
    },
    {
      id: "contribution",
      label: "Contribution Score",
      value: contribution,
      explanation: "Reflects helpful Trust Acts and community participation over time."
    },
    {
      id: "expertise",
      label: "Expertise Score",
      value: expertise,
      explanation: "Grows with a complete profile, headline, and demonstrated skill signals."
    },
    {
      id: "community",
      label: "Community Score",
      value: community,
      explanation: "Signals how often others engage with your verified contributions."
    },
    {
      id: "reliability",
      label: "Reliability Score",
      value: reliability,
      explanation: "Consistency of showing up — streaks support XP, not trust."
    },
    {
      id: "safety",
      label: "Safety Score",
      value: safety,
      explanation:
        "A caution signal only. Trueverse does not guarantee safety or future behavior."
    }
  ];

  const overall = clampScore(
    dimensions.reduce((sum, item) => sum + item.value, 0) / dimensions.length
  );

  return { overall, dimensions };
}
