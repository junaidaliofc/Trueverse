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
  username?: string | null;
  city?: string | null;
  headline?: string | null;
  interests?: string[] | null;
  social_links?: Record<string, string> | null;
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

export type CommunityPostType = "trust_act" | "update" | "help" | "event" | "achievement";
export type CommunityModerationStatus = "visible" | "pending_review" | "removed";
export type CommunityReactionType = "like" | "appreciate";

export type CommunityPost = {
  id: string;
  author_id: string;
  post_type: CommunityPostType;
  title: string | null;
  body: string;
  image_url: string | null;
  category: string | null;
  location: string | null;
  trust_act_id: string | null;
  is_hidden: boolean;
  moderation_status: CommunityModerationStatus;
  created_at: string;
  updated_at: string;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type CommunityAuthor = Pick<
  Profile,
  "id" | "full_name" | "photo_url" | "trust_score" | "trueverse_id" | "username"
>;

export type CommunityPostView = CommunityPost & {
  author: CommunityAuthor | null;
  like_count: number;
  appreciate_count: number;
  comment_count: number;
  liked_by_me: boolean;
  appreciated_by_me: boolean;
  bookmarked_by_me: boolean;
};

export type CommunityCommentView = CommunityComment & {
  author: CommunityAuthor | null;
};
