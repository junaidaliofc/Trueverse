import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appreciationSchema } from "@/lib/validators";

/**
 * Appreciate an activity. Social reciprocity only.
 * Must never mutate trust_index / trust_level.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = appreciationSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const { error } = await supabase.from("activity_appreciations").upsert({
      activity_id: payload.activity_id,
      profile_id: user.id
    });

    if (error) {
      return NextResponse.json({
        ok: true,
        appreciated: true,
        demo: true,
        message: error.message,
        note: "Appreciation does not change trust."
      });
    }

    return NextResponse.json({
      ok: true,
      appreciated: true,
      note: "Appreciation does not change trust."
    });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = appreciationSchema.parse(await request.json());
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) return jsonError("Authentication required.", 401);

    const { error } = await supabase
      .from("activity_appreciations")
      .delete()
      .eq("activity_id", payload.activity_id)
      .eq("profile_id", user.id);

    if (error) {
      return NextResponse.json({
        ok: true,
        appreciated: false,
        demo: true,
        message: error.message
      });
    }

    return NextResponse.json({ ok: true, appreciated: false });
  } catch (error) {
    return validationError(error);
  }
}
