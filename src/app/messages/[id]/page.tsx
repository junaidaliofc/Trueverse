import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { conversationIdSchema } from "@/lib/validators";
import { isMissingRelation } from "@/lib/messages";
import {
  fetchConversationMessages,
  fetchConversations,
  markConversationRead
} from "@/lib/messages-server";
import { LiveMessenger } from "@/components/messages/messenger-shell";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Conversation",
    description: `Trueverse conversation ${id}`
  };
}

export default async function ConversationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsed = conversationIdSchema.safeParse(id);
  if (!parsed.success) notFound();

  const { supabase, profile } = await requireProfile();
  await markConversationRead(supabase, parsed.data, profile.id);

  const [{ conversations, error: listError }, thread] = await Promise.all([
    fetchConversations(supabase, profile.id),
    fetchConversationMessages(supabase, parsed.data, profile.id)
  ]);

  if (listError && isMissingRelation(listError)) {
    notFound();
  }
  if (thread.error && isMissingRelation(thread.error)) {
    notFound();
  }
  if (!thread.conversation) notFound();

  return (
    <LiveMessenger
      key={parsed.data}
      viewerId={profile.id}
      initialConversations={conversations}
      initialMessages={thread.messages}
      selectedId={parsed.data}
      className="h-[calc(100dvh-3.5rem-4.35rem)] sm:h-[calc(100dvh-5.5rem)]"
    />
  );
}
