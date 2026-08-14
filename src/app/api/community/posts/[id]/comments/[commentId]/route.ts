import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { communityCommentSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string; commentId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, commentId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  try {
    const payload = communityCommentSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("community_comments")
      .update({ body: payload.body })
      .eq("id", commentId)
      .eq("post_id", id)
      .eq("author_id", user.id)
      .select("*")
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!data) return jsonError("Comment not found.", 404);

    const { data: author } = await supabase
      .from("profiles")
      .select("id, full_name, photo_url, trust_score, trueverse_id, username")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ comment: { ...data, author: author ?? null } });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id, commentId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const { error } = await supabase
    .from("community_comments")
    .delete()
    .eq("id", commentId)
    .eq("post_id", id)
    .eq("author_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
