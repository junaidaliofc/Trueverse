import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { betaFeedbackSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`feedback:${user.id}`, 8, 60_000);
  if (!limited.ok) return jsonError("Please wait before sending more feedback.", 429);

  try {
    const payload = betaFeedbackSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("beta_feedback")
      .insert({
        profile_id: user.id,
        category: payload.category,
        body: payload.body
      })
      .select("id")
      .single();
    if (error) return jsonError(error.message, 400);
    return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
