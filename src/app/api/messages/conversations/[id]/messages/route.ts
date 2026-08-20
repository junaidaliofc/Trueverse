import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { conversationIdSchema, messageBodySchema } from "@/lib/validators";
import { isMissingRelation } from "@/lib/messages";
import type { ChatMessage } from "@/lib/messages";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsedId = conversationIdSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Conversation not found.", 404);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`messages-send:${user.id}`, 40, 60_000);
  if (!limited.ok) return jsonError("Too many messages. Try again shortly.", 429);

  try {
    await ensureProfile(supabase, user);
    const payload = messageBodySchema.parse(await request.json());

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: parsedId.data,
        sender_id: user.id,
        body: payload.body
      })
      .select("id, conversation_id, sender_id, body, image_url, created_at")
      .single();

    if (error) {
      if (isMissingRelation(error.message)) {
        return jsonError(
          "Messages are not ready. Apply migration 010_messages.sql in Supabase.",
          503
        );
      }
      if (/row-level security|violates/i.test(error.message)) {
        return jsonError("Conversation not found.", 404);
      }
      return jsonError(error.message, 400);
    }

    const message: ChatMessage = {
      ...(data as Omit<ChatMessage, "seen">),
      seen: false
    };

    return NextResponse.json({ message });
  } catch (error) {
    return validationError(error);
  }
}
