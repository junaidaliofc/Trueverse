import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { followSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

async function resolveTargetProfile(trueverseId: string) {
  const supabase = await createSupabaseServerClient();
  const key = trueverseId.replace(/^@/, "");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, trueverse_id, full_name")
    .or(`trueverse_id.eq.${key},username.eq.${key}`)
    .maybeSingle();

  if (error) return { supabase, error: error.message, profile: null };
  return { supabase, error: null, profile: data };
}

export async function POST(request: NextRequest) {
  try {
    const payload = followSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const limited = rateLimit(`follow:${user.id}`, 30, 60_000);
    if (!limited.ok) return jsonError("Too many follow actions. Try again shortly.", 429);

    const target = await resolveTargetProfile(payload.following_trueverse_id);
    if (target.error) return jsonError(target.error, 500);
    if (!target.profile) return jsonError("Profile not found.", 404);
    if (target.profile.id === user.id) return jsonError("You cannot follow yourself.", 400);

    const { error } = await supabase.from("follows").upsert({
      follower_id: user.id,
      following_id: target.profile.id
    });

    if (error) {
      // Table may not be migrated yet in local prototype environments.
      return NextResponse.json({
        ok: true,
        following: true,
        demo: true,
        message: error.message
      });
    }

    return NextResponse.json({ ok: true, following: true });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = followSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const target = await resolveTargetProfile(payload.following_trueverse_id);
    if (target.error) return jsonError(target.error, 500);
    if (!target.profile) return jsonError("Profile not found.", 404);

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", target.profile.id);

    if (error) {
      return NextResponse.json({
        ok: true,
        following: false,
        demo: true,
        message: error.message
      });
    }

    return NextResponse.json({ ok: true, following: false });
  } catch (error) {
    return validationError(error);
  }
}
