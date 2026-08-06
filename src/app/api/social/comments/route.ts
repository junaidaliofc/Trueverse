import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { activityCommentSchema } from "@/lib/validators";

/**
 * Comment on an activity. Never mutates trust.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = activityCommentSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const { data, error } = await supabase
      .from("activity_comments")
      .insert({
        activity_id: payload.activity_id,
        author_id: user.id,
        body: payload.body
      })
      .select("id, activity_id, author_id, body, created_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        ok: true,
        demo: true,
        comment: {
          id: `demo-${Date.now()}`,
          activity_id: payload.activity_id,
          author_id: user.id,
          body: payload.body,
          created_at: new Date().toISOString()
        },
        message: error.message
      });
    }

    return NextResponse.json({ ok: true, comment: data });
  } catch (error) {
    return validationError(error);
  }
}

export async function GET(request: NextRequest) {
  const activityId = request.nextUrl.searchParams.get("activity_id");
  if (!activityId) return jsonError("activity_id is required.", 400);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity_comments")
    .select("id, activity_id, author_id, body, created_at, profiles(full_name, trueverse_id)")
    .eq("activity_id", activityId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ comments: [], demo: true, message: error.message });
  }

  return NextResponse.json({ comments: data ?? [] });
}
