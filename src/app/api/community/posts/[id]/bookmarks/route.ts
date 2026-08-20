import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

/** Private save/unsave. No public bookmark counts. */
export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`community-bookmark:${user.id}`, 40, 60_000);
  if (!limited.ok) return jsonError("Too many saves. Try again shortly.", 429);

  const { data: existing } = await supabase
    .from("community_bookmarks")
    .select("post_id")
    .eq("post_id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("community_bookmarks")
      .delete()
      .eq("post_id", id)
      .eq("profile_id", user.id);
    if (error) return jsonError(error.message, 500);
    return NextResponse.json({ ok: true, bookmarked: false });
  }

  const { error } = await supabase.from("community_bookmarks").insert({
    post_id: id,
    profile_id: user.id
  });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ok: true, bookmarked: true });
}
