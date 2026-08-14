import { NextResponse, type NextRequest } from "next/server";
import { jsonError, validationError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { startConversationSchema } from "@/lib/validators";
import { isMissingRelation } from "@/lib/messages";
import {
  fetchConversations,
  getOrCreateDirectConversation,
  resolveMessagePeer
} from "@/lib/messages-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const { conversations, error } = await fetchConversations(supabase, user.id);
  if (error) {
    if (isMissingRelation(error)) {
      return NextResponse.json({ conversations: [], migrationRequired: true });
    }
    return jsonError(error, 500);
  }

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  const limited = rateLimit(`messages-start:${user.id}`, 20, 60_000);
  if (!limited.ok) return jsonError("Too many conversation requests. Try again shortly.", 429);

  try {
    await ensureProfile(supabase, user);
    const payload = startConversationSchema.parse(await request.json());
    const resolved = await resolveMessagePeer(supabase, payload);
    if (resolved.error && isMissingRelation(resolved.error)) {
      return jsonError(
        "Messages are not ready. Apply migration 010_messages.sql in Supabase.",
        503
      );
    }
    if (resolved.error) return jsonError(resolved.error, 500);
    if (!resolved.peer) return jsonError("Member not found.", 404);
    if (resolved.peer.id === user.id) return jsonError("You cannot message yourself.", 400);

    const created = await getOrCreateDirectConversation(supabase, resolved.peer.id);
    if (created.error) {
      if (isMissingRelation(created.error)) {
        return jsonError(
          "Messages are not ready. Apply migration 010_messages.sql in Supabase.",
          503
        );
      }
      return jsonError(created.error, 400);
    }
    if (!created.id) return jsonError("Unable to start conversation.", 500);

    const { conversations } = await fetchConversations(supabase, user.id);
    const conversation = conversations.find((item) => item.id === created.id) ?? null;

    return NextResponse.json({ id: created.id, conversation });
  } catch (error) {
    return validationError(error);
  }
}
