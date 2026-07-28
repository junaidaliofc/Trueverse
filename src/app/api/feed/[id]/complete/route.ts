import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const { data, error } = await supabase.rpc("complete_help_request", {
    request_id: id,
    requester_user_id: user.id
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  return NextResponse.json({ request: data });
}
