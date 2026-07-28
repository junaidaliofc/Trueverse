import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { responseSchema } from "@/lib/validators";

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

  try {
    const payload = responseSchema.parse(await request.json());
    const { data, error } = await supabase
      .from("community_responses")
      .insert({
        request_id: id,
        author_id: user.id,
        message: payload.message
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ response: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
