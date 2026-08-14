"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessengerShell } from "@/components/messages/messenger-shell";
import { ConversationListSkeleton, ChatThreadSkeleton } from "@/components/messages/messenger-skeletons";
import { ConversationsEmptyState } from "@/components/messages/empty-states";
import { MessageButton } from "@/components/messages/message-button";
import { CommunityFeedCard } from "@/components/community/feed-card";
import { mockPostsForTab } from "@/lib/community-mock";
import {
  MOCK_MESSENGER_VIEWER_ID,
  searchMockPeople,
  seedMockConversations,
  seedMockMessages
} from "@/lib/messages-mock";
import { sortConversations, type ChatMessage, type ConversationView } from "@/lib/messages";

export function Sprint6Preview() {
  const [conversations, setConversations] = useState<ConversationView[]>(seedMockConversations);
  const [threadMap, setThreadMap] = useState(seedMockMessages);
  const [selectedId, setSelectedId] = useState<string | null>("conv-jordan");
  const [typing, setTyping] = useState(false);
  const samplePost = useMemo(() => mockPostsForTab("for_you")[0], []);
  const messages = selectedId ? (threadMap[selectedId] ?? []) : [];

  function markRead(id: string, items: ConversationView[]) {
    return items.map((item) => (item.id === id ? { ...item, unread_count: 0 } : item));
  }

  function onSelect(id: string | null) {
    setSelectedId(id);
    if (id) setConversations((current) => markRead(id, current));
  }

  function onSend(body: string) {
    if (!selectedId) return;
    const created: ChatMessage = {
      id: `local-${crypto.randomUUID()}`,
      conversation_id: selectedId,
      sender_id: MOCK_MESSENGER_VIEWER_ID,
      body,
      image_url: null,
      created_at: new Date().toISOString(),
      seen: false
    };
    setThreadMap((current) => ({
      ...current,
      [selectedId]: [...(current[selectedId] ?? []), created]
    }));
    setConversations((current) =>
      sortConversations(
        current.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                last_message: body.slice(0, 140),
                last_message_at: created.created_at,
                unread_count: 0
              }
            : item
        )
      )
    );
  }

  function onStartConversation(peer: ReturnType<typeof searchMockPeople>[number]) {
    const existing = conversations.find((item) => item.peer.id === peer.id);
    if (existing) {
      onSelect(existing.id);
      return;
    }
    const id = `conv-${peer.id}`;
    const created: ConversationView = {
      id,
      peer,
      last_message: null,
      last_message_at: null,
      unread_count: 0,
      peer_last_read_at: null
    };
    setConversations((current) => sortConversations([created, ...current]));
    setThreadMap((current) => ({ ...current, [id]: [] }));
    setSelectedId(id);
  }

  function simulateIncoming() {
    const target = conversations.find((item) => item.id === "conv-jordan") ?? conversations[0];
    if (!target) return;
    const incoming: ChatMessage = {
      id: `in-${crypto.randomUUID()}`,
      conversation_id: target.id,
      sender_id: target.peer.id,
      body: "On my way — see you at the west gate.",
      image_url: null,
      created_at: new Date().toISOString(),
      seen: false
    };
    setThreadMap((current) => ({
      ...current,
      [target.id]: [...(current[target.id] ?? []), incoming]
    }));
    setConversations((current) =>
      sortConversations(
        current.map((item) =>
          item.id === target.id
            ? {
                ...item,
                last_message: incoming.body,
                last_message_at: incoming.created_at,
                unread_count: selectedId === target.id ? 0 : item.unread_count + 1
              }
            : item
        )
      )
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 py-8">
      <header className="max-w-2xl space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Sprint 6 preview
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Trueverse Messages
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Premium 1:1 messenger. Unread stays at the top. Search by name, Trueverse ID, or email.
          Live /messages uses Supabase; this preview is fully interactive locally.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={simulateIncoming}>
            Simulate incoming
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setTyping((value) => !value)}
          >
            {typing ? "Hide typing" : "Show typing"}
          </Button>
        </div>
      </header>

      <section id="messenger" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Inbox</h2>
        <MessengerShell
          localSearch
          viewerId={MOCK_MESSENGER_VIEWER_ID}
          conversations={conversations}
          messages={messages}
          selectedId={selectedId}
          onSelect={onSelect}
          onSend={onSend}
          onStartConversation={onStartConversation}
          typingVisible={typing}
          className="h-[min(640px,78dvh)]"
        />
      </section>

      <section id="empty" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Empty state</h2>
        <div className="glass-elevated flex min-h-80 items-center justify-center rounded-[1.75rem]">
          <ConversationsEmptyState />
        </div>
      </section>

      <section id="skeletons" className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Loading</h2>
        <div className="glass-elevated grid overflow-hidden rounded-[1.75rem] md:grid-cols-[26rem_1fr]">
          <ConversationListSkeleton />
          <div className="hidden h-[28rem] md:block">
            <ChatThreadSkeleton />
          </div>
        </div>
      </section>

      <section id="integrations" className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Integrations</h2>
        <div className="glass-elevated rounded-[1.75rem] p-5">
          <p className="text-sm font-semibold text-foreground">Public Passport</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Message sits beside Follow on every public Passport.
          </p>
          <div className="mt-4">
            <MessageButton trueverseId="tv_priyanair" mock />
          </div>
        </div>
        {samplePost ? (
          <CommunityFeedCard post={samplePost} viewerId={MOCK_MESSENGER_VIEWER_ID} mock />
        ) : null}
      </section>
    </div>
  );
}
