export type UserRole = "member" | "admin";
export type InteractionStatus = "pending" | "accepted" | "rejected";
export type ReportStatus = "pending" | "approved" | "rejected" | "disputed";

export type Profile = {
  id: string;
  full_name: string;
  photo_url: string | null;
  bio: string;
  trust_score: number;
  streak: number;
  trueverse_id: string;
  role: UserRole;
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

export type HelpRequest = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  location: string | null;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, "full_name" | "photo_url" | "trust_score" | "trueverse_id"> | null;
  community_responses?: CommunityResponse[];
};

export type CommunityResponse = {
  id: string;
  request_id: string;
  author_id: string;
  message: string;
  created_at: string;
  profiles?: Pick<Profile, "full_name" | "photo_url" | "trust_score" | "trueverse_id"> | null;
};

export type AdminReport = NegativeReport & {
  reporter?: Pick<Profile, "full_name" | "trueverse_id" | "trust_score"> | null;
  reported_user?: Pick<Profile, "full_name" | "trueverse_id" | "trust_score"> | null;
};
