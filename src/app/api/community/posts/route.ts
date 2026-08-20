import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { fetchCommunityFeed } from "@/lib/community-server";
import { communityFeedTabSchema, communityPostSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import type { CommunityFeedTab } from "@/lib/community";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const tabParam = request.nextUrl.searchParams.get("tab") ?? "for_you";
  const parsedTab = communityFeedTabSchema.safeParse(tabParam);
  const tab: CommunityFeedTab = parsedTab.success ? parsedTab.data : "for_you";

  const { posts, error } = await fetchCommunityFeed(supabase, {
    tab,
    viewerId: user?.id ?? null,
    limit: 40
  });

  if (error) {
    // Table may not exist until migration is applied — return empty, not fake data.
    if (/does not exist|relation/i.test(error)) {
      return NextResponse.json({ posts: [], tab, migrationRequired: true });
    }
    return jsonError(error, 500);
  }

  return NextResponse.json({ posts, tab });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`community-post:${user.id}`, 20, 60_000);
  if (!limited.ok) return jsonError("Too many posts. Try again shortly.", 429);

  try {
    await ensureProfile(supabase, user);
    const payload = communityPostSchema.parse(await request.json());

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        author_id: user.id,
        post_type: payload.post_type,
        title: payload.title || null,
        body: payload.body,
        image_url: payload.image_url || null,
        category: payload.category || null,
        location: payload.location || null,
        trust_act_id: payload.trust_act_id || null
      })
      .select("*")
      .single();

    if (error) {
      if (/does not exist|relation/i.test(error.message)) {
        return jsonError(
          "Community feed is not ready. Apply migration 008_community_feed.sql in Supabase.",
          503
        );
      }
      if (/invalid input value for enum/i.test(error.message)) {
        return jsonError(
          "Community post types need an update. Apply migration 009_community_interactions.sql in Supabase.",
          503
        );
      }
      if (/column .* does not exist/i.test(error.message)) {
        return jsonError(
          "Community posts need category/location columns. Apply migration 009_community_interactions.sql in Supabase.",
          503
        );
      }
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
