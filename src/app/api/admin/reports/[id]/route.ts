import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reportReviewSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: string }>();

  if (profile?.role !== "admin") {
    return jsonError("Admin access required.", 403);
  }

  try {
    const payload = reportReviewSchema.parse(await request.json());
    const { data, error } = await supabase.rpc("review_negative_report", {
      report_id: id,
      admin_user_id: user.id,
      next_status: payload.status,
      notes: payload.admin_notes ?? null
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    return validationError(error);
  }
}
