import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { referenceSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Leave a Reference about another member. References are structured reputation
 * context and never apply the legacy trust_score delta. One reference per
 * (author, subject) pair is enforced in the database (re-submitting updates it).
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const limited = rateLimit(`reference:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return jsonError("Too many references. Try again shortly.", 429);
  }

  try {
    const payload = referenceSchema.parse(await request.json());
    const subjectKey = payload.subject_trueverse_id.replace(/^@/, "");

    const { data: subject, error: subjectError } = await supabase
      .from("profiles")
      .select("id")
      .or(`trueverse_id.eq.${subjectKey},username.eq.${subjectKey}`)
      .maybeSingle<{ id: string }>();

    if (subjectError) {
      return jsonError(subjectError.message, 500);
    }
    if (!subject) {
      return jsonError("That member was not found.", 404);
    }
    if (subject.id === user.id) {
      return jsonError("You cannot leave a reference for yourself.", 422);
    }

    const { data, error } = await supabase.rpc("submit_reference", {
      subject_id: subject.id,
      relationship: payload.relationship,
      reliable: payload.reliable,
      communicated_clearly: payload.communicated_clearly,
      followed_through: payload.followed_through,
      would_interact_again: payload.would_interact_again,
      note: payload.note ?? ""
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ reference: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
