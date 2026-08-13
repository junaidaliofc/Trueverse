import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string; commentId: string }> };

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
