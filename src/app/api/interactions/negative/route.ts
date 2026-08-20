import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { negativeReportSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const limited = rateLimit(`report:${user.id}`, 5, 60_000);
  if (!limited.ok) {
    return jsonError("Too many reports. Try again shortly.", 429);
  }

  try {
    const payload = negativeReportSchema.parse(await request.json());
    const { data: reporter } = await supabase
      .from("profiles")
      .select("reporting_suspended, reporting_cooldown_until")
      .eq("id", user.id)
      .maybeSingle<{ reporting_suspended: boolean; reporting_cooldown_until: string | null }>();

    if (reporter?.reporting_suspended) {
      return jsonError("Reporting privilege is suspended after repeated rejected reports.", 403);
    }
    if (
      reporter?.reporting_cooldown_until &&
      Date.parse(reporter.reporting_cooldown_until) > Date.now()
    ) {
      return jsonError("Reporting is in a temporary cooldown after rejected reports.", 429);
    }

    const { data: reportedUser, error: reportedUserError } = await supabase
      .from("profiles")
      .select("id")
      .eq("trueverse_id", payload.reported_trueverse_id)
      .single<{ id: string }>();

    if (reportedUserError || !reportedUser) {
      return jsonError("Reported user Trueverse ID was not found.", 404);
    }

    if (reportedUser.id === user.id) {
      return jsonError("You cannot report yourself.", 422);
    }

    const { data, error } = await supabase
      .from("negative_reports")
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUser.id,
        title: payload.title,
        description: payload.description,
        evidence_url: payload.evidence_url
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
