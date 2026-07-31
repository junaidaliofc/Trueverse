/**
 * Trueverse product constants.
 *
 * Architecture layers:
 * 1) Tokens (globals.css) → 2) shadcn primitives (components/ui)
 * → 3) product components (trust/xp/profile/layout) → 4) pages
 *
 * Trust and XP are strictly separate. XP never increases trust.
 */

/** Public trust index is 0–100. XP never affects trust. */

export const TRUST_LEVELS = [
  "new",
  "developing",
  "established",
  "highly_established",
  "exceptional"
] as const;

export type TrustLevel = (typeof TRUST_LEVELS)[number];

export const TRUST_LEVEL_META: Record<
  TrustLevel,
  {
    label: string;
    description: string;
    tone: "neutral" | "info" | "success" | "brand" | "premium";
    min: number;
    max: number;
    stars: number;
  }
> = {
  new: {
    label: "New",
    description: "Building a verified reputation history.",
    tone: "neutral",
    min: 0,
    max: 20,
    stars: 1
  },
  developing: {
    label: "Developing",
    description: "A growing record of verified interactions.",
    tone: "info",
    min: 21,
    max: 40,
    stars: 2
  },
  established: {
    label: "Established",
    description: "Consistent verified community participation.",
    tone: "success",
    min: 41,
    max: 65,
    stars: 3
  },
  highly_established: {
    label: "Highly Established",
    description: "Strong, sustained verified reputation signals.",
    tone: "brand",
    min: 66,
    max: 85,
    stars: 4
  },
  exceptional: {
    label: "Exceptional",
    description: "Rare, long-term verified contribution history.",
    tone: "premium",
    min: 86,
    max: 100,
    stars: 5
  }
};

/**
 * Map public trust index (0–100) → trust level.
 * Server computes the index from verified signals; clients only display.
 */
export function scoreToTrustLevel(score: number): TrustLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 86) return "exceptional";
  if (clamped >= 66) return "highly_established";
  if (clamped >= 41) return "established";
  if (clamped >= 21) return "developing";
  return "new";
}

/** How people earn trust — separate from XP. */
export const TRUST_DIMENSIONS = [
  "helping",
  "reliability",
  "communication",
  "professionalism",
  "safety",
  "community",
  "leadership"
] as const;

export type TrustDimension = (typeof TRUST_DIMENSIONS)[number];

export const TRUST_DIMENSION_META: Record<
  TrustDimension,
  { label: string; shortLabel: string; description: string }
> = {
  helping: {
    label: "Helping Others",
    shortLabel: "Helping",
    description: "Verified help given to people in need."
  },
  reliability: {
    label: "Reliability",
    shortLabel: "Reliability",
    description: "Showing up on time and following through."
  },
  communication: {
    label: "Communication",
    shortLabel: "Communication",
    description: "Clear, respectful, and responsive communication."
  },
  professionalism: {
    label: "Professionalism",
    shortLabel: "Professionalism",
    description: "Conduct in work, freelance, and marketplace settings."
  },
  safety: {
    label: "Safety",
    shortLabel: "Safety",
    description: "Safety pledges, courses, and careful real-world behavior."
  },
  community: {
    label: "Community",
    shortLabel: "Community",
    description: "Consistent participation in community missions and events."
  },
  leadership: {
    label: "Leadership",
    shortLabel: "Leadership",
    description: "Organizing, mentoring, and elevating others."
  }
};

export type ReputationDna = Record<TrustDimension, number>;

export const EMPTY_REPUTATION_DNA: ReputationDna = {
  helping: 0,
  reliability: 0,
  communication: 0,
  professionalism: 0,
  safety: 0,
  community: 0,
  leadership: 0
};

/** Re-export XP engine — XP never increases trust. */
export { XP_LEVEL_THRESHOLDS, xpToLevel } from "@/lib/xp-engine";

export const PRODUCT_DISCLAIMER =
  "Trueverse presents verified reputation signals only. It does not claim anyone is safe, trustworthy, or a good dating partner, and it does not predict compatibility or guarantee safety.";

export const RELATIONSHIP_DISCLAIMER =
  "This information provides verified signals only. It does not predict compatibility or guarantee safety.";

export const TRUST_SIGNAL_FACTORS = [
  "Verified interactions",
  "Identity verification",
  "Account age",
  "Community consistency",
  "Successful dispute resolution",
  "Report history"
] as const;
