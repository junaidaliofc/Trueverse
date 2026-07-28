import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { disputeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const payload = disputeSchema.parse(await request.json());

    // Only the reported user may dispute a report against them.
    const { data: report, error: reportError } = await supabase
      .from("negative_reports")
      .select("id, reported_user_id")
      .eq("id", payload.report_id)
      .single<{ id: string; reported_user_id: string }>();

    if (reportError || !report) {
      return jsonError("Report was not found.", 404);
    }

    if (report.reported_user_id !== user.id) {
      return jsonError("Only the reported user can dispute this report.", 403);
    }

    const { data, error } = await supabase
      .from("disputes")
      .insert({
        report_id: payload.report_id,
        opened_by: user.id,
        reason: payload.reason
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ dispute: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
