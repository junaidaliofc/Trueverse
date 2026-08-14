import { z } from "zod";

export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,24}$/, "Username must be 3–24 characters: letters, numbers, underscore.")
    .optional(),
  bio: z.string().trim().max(280).default(""),
  photo_url: z.string().trim().url().optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  interests: z.string().trim().max(240).optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  linkedin: z.string().trim().url().optional().or(z.literal(""))
});

const publicHandle = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,32}$/, "Use a valid username or Trueverse ID.");

export const positiveInteractionSchema = z.object({
  recipient_trueverse_id: publicHandle,
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(12).max(1000)
});

export const negativeReportSchema = z.object({
  reported_trueverse_id: publicHandle,
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(20).max(1600),
  evidence_url: z.string().trim().url()
});

export const helpRequestSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(12).max(1000),
  location: z.string().trim().max(120).optional().or(z.literal(""))
});

export const responseSchema = z.object({
  message: z.string().trim().min(4).max(800)
});

export const reportReviewSchema = z.object({
  status: z.enum(["approved", "rejected", "disputed"]),
  admin_notes: z.string().trim().max(1000).optional()
});

export const otpVerificationSchema = z.object({
  email: z.string().email(),
  token: z.string().trim().min(6).max(12),
  type: z.enum(["signup", "email", "magiclink"]).default("signup")
});

export const followSchema = z.object({
  following_trueverse_id: publicHandle
});

export const appreciationSchema = z.object({
  activity_id: z.string().trim().min(1).max(64)
});

export const activityCommentSchema = z.object({
  activity_id: z.string().trim().min(1).max(64),
  body: z.string().trim().min(1).max(500)
});

export const communityPostSchema = z.object({
  post_type: z.enum(["trust_act", "update", "help", "event", "achievement"]),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z.string().trim().min(1).max(4000),
  image_url: z.string().trim().url().optional().or(z.literal("")),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  location: z.string().trim().max(80).optional().or(z.literal("")),
  trust_act_id: z.string().uuid().optional()
});

export const communityCommentSchema = z.object({
  body: z.string().trim().min(1).max(800)
});

export const communityReactionSchema = z.object({
  reaction_type: z.enum(["appreciate"])
});

export const communityFeedTabSchema = z.enum([
  "for_you",
  "following",
  "nearby",
  "trending",
  "latest"
]);
