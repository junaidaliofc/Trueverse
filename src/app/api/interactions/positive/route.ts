import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { positiveInteractionSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Authentication required.", 401);
  }

  const limited = rateLimit(`trust-act:${user.id}`, 10, 60_000);
  if (!limited.ok) {
    return jsonError("Too many Trust Acts. Try again shortly.", 429);
  }

  try {
    const payload = positiveInteractionSchema.parse(await request.json());
    const recipientKey = payload.recipient_trueverse_id.replace(/^@/, "");
    const { data: recipient, error: recipientError } = await supabase
      .from("profiles")
      .select("id")
      .or(`trueverse_id.eq.${recipientKey},username.eq.${recipientKey}`)
      .maybeSingle<{ id: string }>();

    if (recipientError) {
      return jsonError(recipientError.message, 500);
    }
    if (!recipient) {
      return jsonError("Recipient was not found.", 404);
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
