import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isMissingRelation } from "@/lib/messages";
import {
  fetchConversations,
  getOrCreateDirectConversation,
  resolveMessagePeer
} from "@/lib/messages-server";
import { LiveMessenger } from "@/components/messages/messenger-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
  description: "Trueverse direct messages — private conversations with members."
};

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  const { supabase, profile } = await requireProfile();

  if (to) {
    const resolved = await resolveMessagePeer(supabase, { trueverse_id: to });
    if (resolved.peer && resolved.peer.id !== profile.id) {
      const created = await getOrCreateDirectConversation(supabase, resolved.peer.id);
      if (created.id) redirect(`/messages/${created.id}`);
    }
  }

  const { conversations, error } = await fetchConversations(supabase, profile.id);
  const items = error && isMissingRelation(error) ? [] : conversations;

  return (
    <LiveMessenger
      key="inbox"
      viewerId={profile.id}
      initialConversations={items}
      className="h-[calc(100dvh-3.5rem-4.35rem)] sm:h-[calc(100dvh-5.5rem)]"
    />
  );
}
