import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingRelation } from "@/lib/messages";
import type { AdminReport } from "@/lib/types";
import type {
  AppealRow,
  BetaAnalytics,
  CommunityReportRow,
  FlaggedAccountRow,
  ModerationAuditRow,
  TrustActReviewRow
} from "@/lib/trust-os";

type Named = { id: string; full_name: string };

async function namesById(supabase: SupabaseClient, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return new Map<string, string>();
  const { data } = await supabase.from("profiles").select("id, full_name").in("id", unique);
  return new Map(((data ?? []) as Named[]).map((row) => [row.id, row.full_name]));
}

export async function fetchAdminTrustOs(supabase: SupabaseClient): Promise<{
  acts: TrustActReviewRow[];
  communityReports: CommunityReportRow[];
  appeals: AppealRow[];
  flagged: FlaggedAccountRow[];
  audit: ModerationAuditRow[];
  analytics: BetaAnalytics;
  error?: string;
}> {
  const [
    actsRes,
    communityRes,
    appealsRes,
    flaggedRes,
    auditRes,
    membersRes,
    reportsRes,
    feedbackRes
  ] = await Promise.all([
    supabase
      .from("positive_interactions")
      .select("id, title, description, status, admin_status, author_id, recipient_id, created_at")
      .or("status.eq.pending,admin_status.eq.pending")
      .order("created_at", { ascending: true })
      .limit(40),
    supabase
      .from("community_reports")
      .select("id, body, status, reporter_id, created_at")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: true })
      .limit(40),
    supabase
      .from("moderation_appeals")
      .select("id, reason, status, target_table, created_at, resolution_notes, appellant_id")
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("profiles")
      .select(
        "id, full_name, trueverse_id, flagged_at, flag_reason, is_disabled, reporter_accuracy, reporting_suspended"
      )
      .or("flagged_at.not.is.null,is_disabled.eq.true,reporting_suspended.eq.true")
      .limit(40),
    supabase
      .from("moderation_audit_log")
      .select(
        "id, admin_id, action, reason, affected_user_id, previous_status, new_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("negative_reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "under_review", "disputed"]),
    supabase.from("beta_feedback").select("id", { count: "exact", head: true })
  ]);

  const firstError =
    actsRes.error?.message ||
    communityRes.error?.message ||
    appealsRes.error?.message ||
    flaggedRes.error?.message ||
    auditRes.error?.message;

  if (firstError && isMissingRelation(firstError)) {
    return {
      acts: [],
      communityReports: [],
      appeals: [],
      flagged: [],
      audit: [],
      analytics: {
        members: membersRes.count ?? 0,
        pending_trust_acts: 0,
        pending_reports: reportsRes.count ?? 0,
        pending_appeals: 0,
        feedback: 0
      },
      error: firstError
    };
  }

  const actRows = (actsRes.data ?? []) as Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    admin_status: string | null;
    author_id: string;
    recipient_id: string;
    created_at: string;
  }>;
  const communityRows = (communityRes.data ?? []) as Array<{
    id: string;
    body: string;
    status: string;
    reporter_id: string;
    created_at: string;
  }>;
  const appealRows = (appealsRes.data ?? []) as Array<AppealRow & { appellant_id: string }>;
  const auditRows = (auditRes.data ?? []) as Array<{
    id: string;
    admin_id: string | null;
    action: string;
    reason: string | null;
    affected_user_id: string | null;
    previous_status: string | null;
    new_status: string | null;
    created_at: string;
  }>;

  const nameMap = await namesById(supabase, [
    ...actRows.flatMap((row) => [row.author_id, row.recipient_id]),
    ...communityRows.map((row) => row.reporter_id),
    ...auditRows.flatMap((row) => [row.admin_id ?? "", row.affected_user_id ?? ""])
  ]);

  return {
    acts: actRows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      admin_status: row.admin_status,
      author_name: nameMap.get(row.author_id) ?? "Member",
      recipient_name: nameMap.get(row.recipient_id) ?? "Member",
      created_at: row.created_at
    })),
    communityReports: communityRows.map((row) => ({
      id: row.id,
      body: row.body,
      status: row.status,
      reporter_name: nameMap.get(row.reporter_id) ?? "Member",
      created_at: row.created_at
    })),
    appeals: appealRows.map(({ appellant_id: _id, ...row }) => row),
    flagged: (flaggedRes.data ?? []) as FlaggedAccountRow[],
    audit: auditRows.map((row) => ({
      ...row,
      admin_name: row.admin_id ? (nameMap.get(row.admin_id) ?? "Admin") : "System",
      affected_name: row.affected_user_id ? (nameMap.get(row.affected_user_id) ?? "Member") : null
    })),
    analytics: {
      members: membersRes.count ?? 0,
      pending_trust_acts: actRows.filter((row) => row.admin_status === "pending").length,
      pending_reports: reportsRes.count ?? 0,
      pending_appeals: appealRows.filter((row) => row.status === "pending").length,
      feedback: feedbackRes.count ?? 0
    },
    error: firstError
  };
}

export async function fetchMyAppeals(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("moderation_appeals")
    .select("id, reason, status, target_table, created_at, resolution_notes")
    .eq("appellant_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  return { appeals: (data ?? []) as AppealRow[], error: error?.message };
}

export async function fetchAdminNegativeReports(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("negative_reports")
    .select(
      "id, reporter_id, reported_user_id, title, description, evidence_url, status, reviewed_by, admin_notes, reviewed_at, created_at, updated_at"
    )
    .in("status", ["pending", "under_review", "disputed"])
    .order("created_at", { ascending: true })
    .limit(50);

  const rows = (data ?? []) as AdminReport[];
  const ids = [...new Set(rows.flatMap((row) => [row.reporter_id, row.reported_user_id]))];
  const byId = new Map<
    string,
    { full_name: string; trueverse_id: string; trust_score: number }
  >();
  if (ids.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, trueverse_id, trust_score")
      .in("id", ids);
    for (const row of (profiles ?? []) as Array<{
      id: string;
      full_name: string;
      trueverse_id: string;
      trust_score: number;
    }>) {
      byId.set(row.id, row);
    }
  }

  return {
    reports: rows.map((row) => ({
      ...row,
      reporter: byId.get(row.reporter_id) ?? {
        full_name: "Member",
        trueverse_id: "tv_unknown",
        trust_score: 0
      },
      reported_user: byId.get(row.reported_user_id) ?? {
        full_name: "Member",
        trueverse_id: "tv_unknown",
        trust_score: 0
      }
    })) as AdminReport[],
    error: error?.message
  };
}
