import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { fetchPostComments } from "@/lib/community-server";
import { communityCommentSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { comments, error } = await fetchPostComments(supabase, id);
  if (error) {
    if (/does not exist|relation/i.test(error)) {
      return NextResponse.json({ comments: [] });
    }
    return jsonError(error, 500);
  }
  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`community-comment:${user.id}`, 40, 60_000);
  if (!limited.ok) return jsonError("Too many comments. Try again shortly.", 429);

  try {
    await ensureProfile(supabase, user);
    const payload = communityCommentSchema.parse(await request.json());

    const { data: post } = await supabase
      .from("community_posts")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (!post) return jsonError("Post not found.", 404);

    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: id,
        author_id: user.id,
        body: payload.body
      })
      .select("*")
      .single();

    if (error) return jsonError(error.message, 500);

    const { data: author } = await supabase
      .from("profiles")
      .select("id, full_name, photo_url, trust_score, trueverse_id, username")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json(
      { comment: { ...data, author: author ?? null } },
      { status: 201 }
    );
  } catch (error) {
    return validationError(error);
  }
}
