import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { positiveInteractionSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  try {
    const payload = positiveInteractionSchema.parse(await request.json());
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id")
      .eq("trueverse_id", payload.recipient_trueverse_id)
      .single<{ id: string }>();

    if (recipientError || !recipient) {
      return jsonError("Recipient Trueverse ID was not found.", 404);
    }

    if (recipient.id === user.id) {
      return jsonError("You cannot submit an interaction for yourself.", 422);
    }

    const { data, error } = await supabase
      .from("positive_interactions")
      .insert({
        author_id: user.id,
        recipient_id: recipient.id,
        title: payload.title,
        description: payload.description
      })
      .select("*")
      .single();

    if (error) {
      return jsonError(error.message, 500);
    }

    return NextResponse.json({ interaction: data }, { status: 201 });
  } catch (error) {
    return validationError(error);
  }
}
