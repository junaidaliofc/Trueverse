import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
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

  const limited = rateLimit(`trust-act-reject:${user.id}`, 20, 60_000);
  if (!limited.ok) {
    return jsonError("Too many requests. Try again shortly.", 429);
  }

  const { data, error } = await supabase.rpc("reject_positive_interaction", {
    interaction_id: id,
    rejecting_user_id: user.id
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  const acceptsHtml = request.headers.get("accept")?.includes("text/html");
  if (acceptsHtml) {
    return NextResponse.redirect(new URL("/interactions", request.url), 303);
  }

  return NextResponse.json({ interaction: data });
}
