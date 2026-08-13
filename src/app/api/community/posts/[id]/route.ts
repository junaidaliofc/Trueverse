import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchCommunityPostById } from "@/lib/community-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const post = await fetchCommunityPostById(supabase, id, user?.id ?? null);
  if (!post) return jsonError("Post not found.", 404);
  return NextResponse.json({ post });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true });
}
