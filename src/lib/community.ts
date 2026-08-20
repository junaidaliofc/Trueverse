/**
 * Community feed helpers.
 * Reactions / likes / bookmarks never mutate trust.
 */

import type {
  CommunityAuthor,
  CommunityCommentView,
  CommunityPost,
  CommunityPostType,
  CommunityPostView,
  CommunityReactionType
} from "@/lib/types";
import { scoreToTrustLevel } from "@/lib/design";

export type CommunityFeedTab = "for_you" | "following" | "nearby" | "trending" | "latest";

export const COMMUNITY_CATEGORIES = [
  "Neighborhood",
  "Volunteer",
  "Mutual aid",
  "Skills",
  "Safety",
  "Other"
] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export const COMPOSER_POST_TYPES = ["update", "achievement", "help"] as const;

export const POST_BODY_MAX = 4000;
export const COMMENT_BODY_MAX = 800;

/** Feed architecture supports sponsored slots without rewriting the list. */
export type OrganicFeedEntry = {
  kind: "organic";
  id: string;
  post: CommunityPostView;
};

export type SponsoredFeedEntry = {
  kind: "sponsored";
  id: string;
  enabled: boolean;
  advertiser?: string;
  title?: string;
  body?: string;
};

export type FeedEntry = OrganicFeedEntry | SponsoredFeedEntry;

export const POST_TYPE_META: Record<
  CommunityPostType,
  { label: string; composerLabel: string; placeholder: string; tone: string }
> = {
  trust_act: {
    label: "Trust Act",
    composerLabel: "Positive Trust Act",
    placeholder: "Recognize someone helpful in your community…",
    tone: "bg-brand-soft text-brand"
  },
  update: {
    label: "Update",
    composerLabel: "Community Update",
    placeholder: "Share what's happening in your community…",
    tone: "bg-muted text-foreground"
  },
  help: {
    label: "Help",
    composerLabel: "Ask for Help",
    placeholder: "What do you need help with?",
    tone: "bg-warning-soft text-warning"
  },
  event: {
    label: "Event",
    composerLabel: "Event",
    placeholder: "Share an upcoming community event…",
    tone: "bg-xp-soft text-xp"
  },
  achievement: {
    label: "Achievement",
    composerLabel: "Achievement",
    placeholder: "Share a badge or milestone you actually unlocked…",
    tone: "bg-success-soft text-success"
  }
};

export function communityPostPath(postId: string) {
  return `/community/post/${postId}`;
}

export function authorHandle(author: CommunityAuthor | null | undefined) {
  if (!author) return "member";
  if (author.username) return author.username.replace(/^@/, "").toLowerCase();
  return author.trueverse_id.replace(/^tv_/, "").toLowerCase();
}

export function authorTrustLevel(author: CommunityAuthor | null | undefined) {
  if (!author) return scoreToTrustLevel(0);
  const score =
    typeof author.trust_score === "number" && author.trust_score > 100
      ? Math.round(author.trust_score / 10)
      : author.trust_score ?? 0;
  return scoreToTrustLevel(Math.max(0, Math.min(100, score)));
}

type ReactionRow = {
  post_id: string;
  profile_id: string;
  reaction_type: CommunityReactionType;
};

type BookmarkRow = {
  post_id: string;
};

type CommentCountRow = {
  post_id: string;
};

export function assemblePostViews(options: {
  posts: CommunityPost[];
  authorsById: Map<string, CommunityAuthor>;
  reactions: ReactionRow[];
  bookmarks: BookmarkRow[];
  commentCounts: CommentCountRow[];
  viewerId?: string | null;
}): CommunityPostView[] {
  const { posts, authorsById, reactions, bookmarks, commentCounts, viewerId } = options;

  const likeCounts = new Map<string, number>();
  const appreciateCounts = new Map<string, number>();
  const likedByMe = new Set<string>();
  const appreciatedByMe = new Set<string>();

  for (const reaction of reactions) {
    if (reaction.reaction_type === "like") {
      likeCounts.set(reaction.post_id, (likeCounts.get(reaction.post_id) ?? 0) + 1);
      if (viewerId && reaction.profile_id === viewerId) likedByMe.add(reaction.post_id);
    } else if (reaction.reaction_type === "appreciate") {
      appreciateCounts.set(
        reaction.post_id,
        (appreciateCounts.get(reaction.post_id) ?? 0) + 1
      );
      if (viewerId && reaction.profile_id === viewerId) {
        appreciatedByMe.add(reaction.post_id);
      }
    }
  }

  const bookmarked = new Set(bookmarks.map((b) => b.post_id));
  const comments = new Map<string, number>();
  for (const row of commentCounts) {
    comments.set(row.post_id, (comments.get(row.post_id) ?? 0) + 1);
  }

  return posts.map((post) => ({
    ...post,
    author: authorsById.get(post.author_id) ?? null,
    like_count: likeCounts.get(post.id) ?? 0,
    appreciate_count: appreciateCounts.get(post.id) ?? 0,
    comment_count: comments.get(post.id) ?? 0,
    liked_by_me: likedByMe.has(post.id),
    appreciated_by_me: appreciatedByMe.has(post.id),
    bookmarked_by_me: bookmarked.has(post.id)
  }));
}

/**
 * Insert labeled sponsored slots every `every` organic posts.
 */
export function buildFeedEntries(
  posts: CommunityPostView[],
  options?: {
    every?: number;
    sponsored?: { advertiser: string; title: string; body: string };
  }
): FeedEntry[] {
  const every = options?.every ?? 10;
  const entries: FeedEntry[] = [];
  let organic = 0;

  for (const post of posts) {
    entries.push({ kind: "organic", id: post.id, post });
    organic += 1;
    if (organic > 0 && organic % every === 0) {
      entries.push({
        kind: "sponsored",
        id: `sponsored-slot-${organic / every}`,
        enabled: true,
        advertiser: options?.sponsored?.advertiser ?? "Trueverse",
        title: options?.sponsored?.title ?? "Sponsored",
        body:
          options?.sponsored?.body ??
          "Placeholder sponsored placement. Clearly labeled and separate from reputation."
      });
    }
  }

  return entries;
}

export function assembleCommentViews(
  comments: Array<{
    id: string;
    post_id: string;
    author_id: string;
    body: string;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
  }>,
  authorsById: Map<string, CommunityAuthor>
): CommunityCommentView[] {
  return comments.map((comment) => ({
    ...comment,
    author: authorsById.get(comment.author_id) ?? null
  }));
}
