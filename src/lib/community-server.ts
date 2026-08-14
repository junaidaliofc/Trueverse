import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assembleCommentViews,
  assemblePostViews,
  type CommunityFeedTab
} from "@/lib/community";
import type {
  CommunityAuthor,
  CommunityCommentView,
  CommunityPost,
  CommunityPostView
} from "@/lib/types";

type ProfileLite = CommunityAuthor;

async function loadAuthors(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, ProfileLite>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (!unique.length) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, photo_url, trust_score, trueverse_id, username")
    .in("id", unique)
    .eq("is_disabled", false);

  return new Map(((data ?? []) as ProfileLite[]).map((p) => [p.id, p]));
}

export async function fetchCommunityFeed(
  supabase: SupabaseClient,
  options: {
    tab: CommunityFeedTab;
    viewerId?: string | null;
    limit?: number;
  }
): Promise<{ posts: CommunityPostView[]; error?: string }> {
  const limit = options.limit ?? 30;
  let query = supabase
    .from("community_posts")
    .select("*")
    .eq("is_hidden", false)
    .eq("moderation_status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options.tab === "following" && options.viewerId) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", options.viewerId);

    const followingIds = (follows ?? []).map((row) => row.following_id as string);
    if (!followingIds.length) {
      return { posts: [] };
    }
    query = query.in("author_id", followingIds);
  }

  // Nearby is prepared but not location-gated yet — behave like Latest.
  // for_you currently uses chronological Latest as the baseline ranking.
  const { data, error } = await query;
  if (error) {
    return { posts: [], error: error.message };
  }

  const posts = (data ?? []) as CommunityPost[];
  if (!posts.length) return { posts: [] };

  const postIds = posts.map((p) => p.id);
  const [authorsById, reactionsRes, bookmarksRes, commentsRes] = await Promise.all([
    loadAuthors(
      supabase,
      posts.map((p) => p.author_id)
    ),
    supabase
      .from("community_reactions")
      .select("post_id, profile_id, reaction_type")
      .in("post_id", postIds),
    options.viewerId
      ? supabase
          .from("community_bookmarks")
          .select("post_id")
          .eq("profile_id", options.viewerId)
          .in("post_id", postIds)
      : Promise.resolve({ data: [] as Array<{ post_id: string }> }),
    supabase.from("community_comments").select("post_id").eq("is_hidden", false).in("post_id", postIds)
  ]);

  let views = assemblePostViews({
    posts,
    authorsById,
    reactions: (reactionsRes.data ?? []) as Array<{
      post_id: string;
      profile_id: string;
      reaction_type: "like" | "appreciate";
    }>,
    bookmarks: (bookmarksRes.data ?? []) as Array<{ post_id: string }>,
    commentCounts: (commentsRes.data ?? []) as Array<{ post_id: string }>,
    viewerId: options.viewerId
  });

  if (options.tab === "trending") {
    views = [...views].sort((a, b) => {
      const score =
        b.appreciate_count + b.comment_count * 2 - (a.appreciate_count + a.comment_count * 2);
      if (score !== 0) return score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  if (options.tab === "nearby") {
    const located = views.filter((post) => Boolean(post.location?.trim()));
    if (located.length) views = located;
  }

  return { posts: views };
}

export async function fetchCommunityPostById(
  supabase: SupabaseClient,
  postId: string,
  viewerId?: string | null
): Promise<CommunityPostView | null> {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (error || !data) return null;
  const post = data as CommunityPost;

  const [authorsById, reactionsRes, bookmarksRes, commentsRes] = await Promise.all([
    loadAuthors(supabase, [post.author_id]),
    supabase
      .from("community_reactions")
      .select("post_id, profile_id, reaction_type")
      .eq("post_id", postId),
    viewerId
      ? supabase
          .from("community_bookmarks")
          .select("post_id")
          .eq("profile_id", viewerId)
          .eq("post_id", postId)
      : Promise.resolve({ data: [] as Array<{ post_id: string }> }),
    supabase
      .from("community_comments")
      .select("post_id")
      .eq("is_hidden", false)
      .eq("post_id", postId)
  ]);

  const [view] = assemblePostViews({
    posts: [post],
    authorsById,
    reactions: (reactionsRes.data ?? []) as Array<{
      post_id: string;
      profile_id: string;
      reaction_type: "like" | "appreciate";
    }>,
    bookmarks: (bookmarksRes.data ?? []) as Array<{ post_id: string }>,
    commentCounts: (commentsRes.data ?? []) as Array<{ post_id: string }>,
    viewerId
  });

  return view ?? null;
}

export async function fetchPostComments(
  supabase: SupabaseClient,
  postId: string
): Promise<{ comments: CommunityCommentView[]; error?: string }> {
  const { data, error } = await supabase
    .from("community_comments")
    .select("*")
    .eq("post_id", postId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) return { comments: [], error: error.message };
  const rows = data ?? [];
  const authorsById = await loadAuthors(
    supabase,
    rows.map((row) => row.author_id as string)
  );
  return { comments: assembleCommentViews(rows as never, authorsById) };
}

export async function fetchSavedPosts(
  supabase: SupabaseClient,
  viewerId: string
): Promise<{ posts: CommunityPostView[]; error?: string }> {
  const { data: bookmarks, error } = await supabase
    .from("community_bookmarks")
    .select("post_id, created_at")
    .eq("profile_id", viewerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return { posts: [], error: error.message };
  const ids = (bookmarks ?? []).map((b) => b.post_id as string);
  if (!ids.length) return { posts: [] };

  const { data: posts, error: postsError } = await supabase
    .from("community_posts")
    .select("*")
    .in("id", ids)
    .eq("is_hidden", false)
    .eq("moderation_status", "visible");

  if (postsError) return { posts: [], error: postsError.message };

  const ordered = ids
    .map((id) => ((posts ?? []) as CommunityPost[]).find((p) => p.id === id))
    .filter(Boolean) as CommunityPost[];

  const [authorsById, reactionsRes, commentsRes] = await Promise.all([
    loadAuthors(
      supabase,
      ordered.map((p) => p.author_id)
    ),
    supabase
      .from("community_reactions")
      .select("post_id, profile_id, reaction_type")
      .in("post_id", ids),
    supabase.from("community_comments").select("post_id").eq("is_hidden", false).in("post_id", ids)
  ]);

  return {
    posts: assemblePostViews({
      posts: ordered,
      authorsById,
      reactions: (reactionsRes.data ?? []) as Array<{
        post_id: string;
        profile_id: string;
        reaction_type: "like" | "appreciate";
      }>,
      bookmarks: ids.map((post_id) => ({ post_id })),
      commentCounts: (commentsRes.data ?? []) as Array<{ post_id: string }>,
      viewerId
    })
  };
}
