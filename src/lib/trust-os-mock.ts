import type {
  AppealRow,
  BetaAnalytics,
  CommunityReportRow,
  FlaggedAccountRow,
  ModerationAuditRow,
  TrustActReviewRow
} from "@/lib/trust-os";

const origin = Date.parse("2026-08-14T16:00:00.000Z");

function hoursAgo(hours: number) {
  return new Date(origin - hours * 60 * 60 * 1000).toISOString();
}

export const mockPendingTrustActs: TrustActReviewRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Westside pantry coordination",
    description: "Sarah organized crates and rides for Saturday’s pantry.",
    status: "accepted",
    admin_status: "pending",
    author_name: "Sarah Kim",
    recipient_name: "Aria Morgan",
    created_at: hoursAgo(4)
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Ride to the clinic",
    description: "Omar drove a neighbor to a morning appointment.",
    status: "pending",
    admin_status: null,
    author_name: "Omar Patel",
    recipient_name: "Maya Chen",
    created_at: hoursAgo(9)
  }
];

export const mockCommunityReports: CommunityReportRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    body: "This post looks like a duplicate shout-out, not harassment.",
    status: "pending",
    reporter_name: "Lena Brooks",
    created_at: hoursAgo(6)
  }
];

export const mockAppeals: AppealRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000021",
    reason: "The rejected Trust Act was a real pantry shift with two witnesses.",
    status: "pending",
    target_table: "positive_interactions",
    created_at: hoursAgo(12),
    resolution_notes: null
  },
  {
    id: "00000000-0000-4000-8000-000000000022",
    reason: "I asked for a review of a report that mixed me up with someone else.",
    status: "under_review",
    target_table: "negative_reports",
    created_at: hoursAgo(30),
    resolution_notes: null
  }
];

export const mockFlaggedAccounts: FlaggedAccountRow[] = [
  {
    id: "user-flagged",
    full_name: "Flagged Demo",
    trueverse_id: "tv_flaggeddemo",
    flagged_at: hoursAgo(18),
    flag_reason: "Repeated rejected reports",
    is_disabled: false,
    reporter_accuracy: 20,
    reporting_suspended: false
  }
];

export const mockAuditLog: ModerationAuditRow[] = [
  {
    id: "log-1",
    admin_id: "admin",
    admin_name: "Jordan Admin",
    action: "reject_report",
    reason: "No evidence of harm. Neighborhood disagreement is not a Trust penalty.",
    affected_user_id: "user-omar",
    affected_name: "Omar Patel",
    previous_status: "pending",
    new_status: "rejected",
    created_at: hoursAgo(2)
  },
  {
    id: "log-2",
    admin_id: "admin",
    admin_name: "Jordan Admin",
    action: "approve_trust_act",
    reason: "Recipient confirmed. Two witnesses named.",
    affected_user_id: "user-sarah",
    affected_name: "Sarah Kim",
    previous_status: "pending",
    new_status: "approved",
    created_at: hoursAgo(7)
  }
];

export const mockBetaAnalytics: BetaAnalytics = {
  members: 128,
  pending_trust_acts: mockPendingTrustActs.filter((item) => item.admin_status === "pending").length,
  pending_reports: 3,
  pending_appeals: mockAppeals.filter((item) => item.status === "pending").length,
  feedback: 11
};

export const mockReporterNotice = {
  accuracy: 20,
  cooldown: true,
  suspended: false
};
