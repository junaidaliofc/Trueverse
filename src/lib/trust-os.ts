export const TRUST_OS_BADGES = [
  {
    id: "verified-identity",
    label: "Verified Identity",
    description: "Optional identity check. Does not raise Trust Score."
  },
  {
    id: "verified-business",
    label: "Verified Business",
    description: "Local business Passport. Display only."
  },
  {
    id: "community-leader",
    label: "Community Leader",
    description: "Recognized for organizing help. Not a trust rank."
  },
  {
    id: "volunteer",
    label: "Volunteer",
    description: "Showed up for verified help. Cosmetic recognition."
  },
  {
    id: "moderator",
    label: "Moderator",
    description: "Trust OS reviewer. Authority is not a trust bonus."
  },
  {
    id: "organization",
    label: "Organization",
    description: "Registered group Passport. Display only."
  },
  {
    id: "founder",
    label: "Founder",
    description: "Built Trueverse. Never a trust multiplier."
  },
  {
    id: "early-member",
    label: "Early Member",
    description: "Joined during public beta."
  }
] as const;

export type TrustOsBadgeId = (typeof TRUST_OS_BADGES)[number]["id"];

export const IDENTITY_ARCHITECTURE = [
  {
    id: "identity_verification",
    label: "Identity Verification",
    note: "Prepared status field. Not required for beta. Never auto-grants Trust."
  },
  {
    id: "duplicate_accounts",
    label: "Duplicate Account Detection",
    note: "Prepared risk score 0–100. Unused in scoring today."
  },
  {
    id: "phone_verification",
    label: "Phone Verification",
    note: "Prepared timestamp. Optional later. Not a Trust input."
  },
  {
    id: "government_id",
    label: "Government ID",
    note: "Prepared for a future optional check. Display only until that program ships."
  },
  {
    id: "device_signals",
    label: "Device Signals",
    note: "Prepared envelope for one-person-one-reputation. Empty in beta."
  },
  {
    id: "behavior_signals",
    label: "Behavior Signals",
    note: "Prepared envelope. Never manufactures Trust Score."
  }
] as const;

export function trustOsBadgeCards(earnedIds: readonly string[] = []) {
  const earned = new Set(earnedIds);
  return TRUST_OS_BADGES.map((badge) => ({
    id: badge.id,
    name: badge.label,
    label: badge.label,
    description: badge.description,
    earned: earned.has(badge.id)
  }));
}

export const LAUNCH_CHECKLIST = [
  { id: "auth", label: "Authentication", href: "/auth/login" },
  { id: "passport", label: "Passport", href: "/passport" },
  { id: "community", label: "Community", href: "/community" },
  { id: "messaging", label: "Messaging", href: "/messages" },
  { id: "notifications", label: "Notifications", href: "/notifications" },
  { id: "search", label: "Search", href: "/design-system/sprint7" },
  { id: "reputation", label: "Reputation Engine", href: "/trust" },
  { id: "moderation", label: "Moderation", href: "/admin" },
  { id: "feedback", label: "Feedback System", href: "/launch" },
  { id: "mobile", label: "Mobile Responsive", href: "/launch" },
  { id: "a11y", label: "Accessibility", href: "/launch" },
  { id: "dark", label: "Dark Mode", href: "/launch" }
] as const;

export const FEEDBACK_CATEGORIES = [
  { id: "bug", label: "Bug" },
  { id: "suggestion", label: "Suggestion" },
  { id: "feature", label: "Feature Request" },
  { id: "confusing_ui", label: "Confusing UI" }
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["id"];

export type AppealStatus = "pending" | "under_review" | "accepted" | "rejected";
export type AdminTab =
  | "acts"
  | "reports"
  | "community"
  | "flagged"
  | "appeals"
  | "audit"
  | "analytics";

export const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "acts", label: "Pending Positive Trust Acts" },
  { id: "reports", label: "Pending Negative Reports" },
  { id: "community", label: "Community Reports" },
  { id: "flagged", label: "Flagged Accounts" },
  { id: "appeals", label: "Appeals" },
  { id: "audit", label: "Audit Log" },
  { id: "analytics", label: "Beta Analytics" }
];

export type ModerationAuditRow = {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  action: string;
  reason: string | null;
  affected_user_id: string | null;
  affected_name: string | null;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
};

export type TrustActReviewRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  admin_status: string | null;
  author_name: string;
  recipient_name: string;
  created_at: string;
};

export type CommunityReportRow = {
  id: string;
  body: string;
  status: string;
  reporter_name: string;
  created_at: string;
};

export type AppealRow = {
  id: string;
  reason: string;
  status: AppealStatus;
  target_table: string;
  created_at: string;
  resolution_notes: string | null;
};

export type FlaggedAccountRow = {
  id: string;
  full_name: string;
  trueverse_id: string;
  flagged_at: string | null;
  flag_reason: string | null;
  is_disabled: boolean;
  reporter_accuracy: number | null;
  reporting_suspended: boolean;
};

export type BetaAnalytics = {
  members: number;
  pending_trust_acts: number;
  pending_reports: number;
  pending_appeals: number;
  feedback: number;
};

export function reporterAccuracyLabel(value: number | null | undefined) {
  if (value == null) return "No history";
  return `${value}% accurate`;
}
