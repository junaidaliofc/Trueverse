import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { conversationIdSchema } from "@/lib/validators";
import { isMissingRelation } from "@/lib/messages";
import { fetchConversationMessages, markConversationRead } from "@/lib/messages-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = conversationIdSchema.safeParse(id);
  if (!parsed.success) return jsonError("Conversation not found.", 404);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  await markConversationRead(supabase, parsed.data, user.id);
  const { conversation, messages, error } = await fetchConversationMessages(
    supabase,
    parsed.data,
    user.id
  );

  if (error) {
    if (isMissingRelation(error)) {
      return jsonError(
        "Messages are not ready. Apply migration 010_messages.sql in Supabase.",
        503
      );
    }
    return jsonError(error, 500);
  }
  if (!conversation) return jsonError("Conversation not found.", 404);

  return NextResponse.json({ conversation, messages });
}
