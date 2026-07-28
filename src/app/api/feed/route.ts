import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { helpRequestSchema } from "@/lib/validators";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("help_requests")
    .select(
      "*, profiles:profiles!help_requests_author_id_fkey(full_name, photo_url, trust_score, trueverse_id), helper:profiles!help_requests_helper_id_fkey(full_name, photo_url, trust_score, trueverse_id), community_responses(*, profiles(full_name, photo_url, trust_score, trueverse_id))"
    )
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ requests: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const payload = helpRequestSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("help_requests")
      .insert({
        author_id: user.id,
        title: payload.title,
        description: payload.description,
        location: payload.location || null
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
