import { NextResponse, type NextRequest } from "next/server";
import { jsonError } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { conversationIdSchema } from "@/lib/validators";
import { markConversationRead } from "@/lib/messages-server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = conversationIdSchema.safeParse(id);
  if (!parsed.success) return jsonError("Conversation not found.", 404);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return jsonError("Authentication required.", 401);

  await markConversationRead(supabase, parsed.data, user.id);
  return NextResponse.json({ ok: true });
}
