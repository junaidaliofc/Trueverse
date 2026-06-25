export type UserRole = "member" | "admin";
export type InteractionStatus = "pending" | "accepted" | "rejected" | "expired";
export type ReportStatus = "pending" | "under_review" | "approved" | "rejected" | "disputed";
export type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  photo_url: string | null;
  bio: string;
  trust_score: number;
  streak: number;
  trueverse_id: string;
  role: UserRole;
  is_disabled: boolean;
  last_positive_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PositiveInteraction = {
  id: string;
  author_id: string;
  recipient_id: string;
  title: string;
  description: string;
  status: InteractionStatus;
  accepted_at: string | null;
  rejected_at: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type NegativeReport = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  title: string;
  description: string;
  evidence_url: string;
  status: ReportStatus;
  reviewed_by: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportEvidence = {
  id: string;
  report_id: string;
  uploaded_by: string;
  file_url: string;
  storage_path: string | null;
  content_type: string | null;
  description: string | null;
  created_at: string;
};

export type Dispute = {
  id: string;
  report_id: string;
  opened_by: string;
  reason: string;
  status: DisputeStatus;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export type HelpRequest = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  location: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  profiles?: Pick<Profile, "full_name" | "photo_url" | "trust_score" | "trueverse_id"> | null;
  community_responses?: CommunityResponse[];
};

export type CommunityResponse = {
  id: string;
  request_id: string;
  author_id: string;
  message: string;
  is_hidden: boolean;
  created_at: string;
  profiles?: Pick<Profile, "full_name" | "photo_url" | "trust_score" | "trueverse_id"> | null;
};

export type AdminReport = NegativeReport & {
  reporter?: Pick<Profile, "full_name" | "trueverse_id" | "trust_score"> | null;
  reported_user?: Pick<Profile, "full_name" | "trueverse_id" | "trust_score"> | null;
};
