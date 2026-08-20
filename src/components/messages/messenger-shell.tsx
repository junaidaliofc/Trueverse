"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrueverseIdLink } from "@/components/identity/member-links";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { ConversationCard } from "@/components/messages/conversation-card";
import { ChatWindow } from "@/components/messages/chat-window";
import { ConversationListSkeleton } from "@/components/messages/messenger-skeletons";
import { ChatEmptyPane, ConversationsEmptyState } from "@/components/messages/empty-states";
import {
  conversationPath,
  filterConversations,
  peerTrustLevel,
  sortConversations,
  type ChatMessage,
  type ConversationView,
  type MessagePeer
} from "@/lib/messages";
import {
  fetchConversationList,
  fetchConversationThread,
  searchPeopleRequest,
  sendMessageRequest,
  startConversationRequest
} from "@/lib/messages-client";
import { searchMockPeople } from "@/lib/messages-mock";
import { cn } from "@/lib/utils";

export function MessengerShell({
  viewerId,
  conversations,
  messages,
  selectedId,
  onSelect,
  onSend,
  onStartConversation,
  typingVisible = false,
  loadingList = false,
  loadingThread = false,
  sending = false,
  localSearch = false,
  className
}: {
  viewerId: string;
  conversations: ConversationView[];
  messages: ChatMessage[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onSend: (body: string) => Promise<void> | void;
  onStartConversation: (peer: MessagePeer) => Promise<void> | void;
  typingVisible?: boolean;
  loadingList?: boolean;
  loadingThread?: boolean;
  sending?: boolean;
  localSearch?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<MessagePeer[]>([]);
  const visibleConversations = useMemo(
    () => filterConversations(conversations, query),
    [conversations, query]
  );
  const activeConversation = conversations.find((item) => item.id === selectedId) ?? null;
  const knownPeerIds = useMemo(
    () => new Set(conversations.map((item) => item.peer.id)),
    [conversations]
  );
  const searching = query.trim().length > 0;
  const peopleResults = searching
    ? people.filter((person) => !knownPeerIds.has(person.id))
    : [];

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) return;
    const timer = window.setTimeout(async () => {
      if (localSearch) {
        setPeople(searchMockPeople(q));
        return;
      }
      const result = await searchPeopleRequest(q);
      setPeople(result.people ?? []);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, localSearch]);

  const showChat = Boolean(activeConversation);

  return (
    <div
      className={cn(
        "glass-elevated flex min-h-0 overflow-hidden rounded-none md:rounded-[1.75rem]",
        className
      )}
      data-messenger="true"
    >
      <aside
        className={cn(
          "flex min-h-0 w-full flex-col border-border/60 md:w-[22rem] md:border-r lg:w-[26rem]",
          showChat ? "hidden md:flex" : "flex"
        )}
        aria-label="Conversations"
      >
        <div className="border-b border-border/60 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Messages</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Inbox
          </h1>
          <label className="relative mt-4 block">
            <span className="sr-only">Search people</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people..."
              className="h-11 rounded-2xl bg-muted/50 pl-9"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingList ? (
            <ConversationListSkeleton />
          ) : (
            <>
              {peopleResults.length > 0 ? (
                <div className="border-b border-border/50 px-3 py-3">
                  <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    People
                  </p>
                  <ul className="space-y-1">
                    {peopleResults.map((person) => (
                      <li key={person.id}>
                        <div className="flex items-center gap-3 rounded-2xl p-2.5">
                          <UserAvatar
                            name={person.full_name}
                            src={person.photo_url}
                            size="md"
                            href={`/u/${person.trueverse_id.replace(/^tv_/, "")}`}
                          />
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/u/${person.trueverse_id.replace(/^tv_/, "")}`}
                              className="truncate text-sm font-semibold text-foreground hover:text-primary"
                            >
                              {person.full_name}
                            </Link>
                            <TrueverseIdLink id={person.trueverse_id} />
                            <div className="mt-1">
                              <TrustLevelBadge level={peerTrustLevel(person)} showLabel={false} />
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              setQuery("");
                              void onStartConversation(person);
                            }}
                          >
                            Start conversation
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {visibleConversations.length ? (
                <div className="p-2">
                  {visibleConversations.map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      active={conversation.id === selectedId}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              ) : searching ? (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No matching conversations. Search a display name, Trueverse ID, or email to start
                  one.
                </p>
              ) : (
                <ConversationsEmptyState />
              )}
            </>
          )}
        </div>
      </aside>

      <div className={cn("min-h-0 min-w-0 flex-1", showChat ? "flex" : "hidden md:flex")}>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            viewerId={viewerId}
            loading={loadingThread}
            sending={sending}
            typingVisible={typingVisible}
            onBack={() => onSelect(null)}
            onSend={onSend}
          />
        ) : (
          <ChatEmptyPane />
        )}
      </div>
    </div>
  );
}

export function LiveMessenger({
  viewerId,
  initialConversations,
  initialMessages = [],
  selectedId = null,
  className
}: {
  viewerId: string;
  initialConversations: ConversationView[];
  initialMessages?: ChatMessage[];
  selectedId?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    fetchConversationThread(selectedId).then((result) => {
      if (cancelled || !result.ok) return;
      setMessages(result.messages ?? []);
      if (result.conversation) {
        setConversations((current) =>
          sortConversations(
            current.map((item) =>
              item.id === result.conversation?.id
                ? { ...result.conversation, unread_count: 0 }
                : item
            )
          )
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    async function refresh() {
      const list = await fetchConversationList();
      if (list.ok && list.conversations) setConversations(list.conversations);
      if (selectedId) {
        const thread = await fetchConversationThread(selectedId);
        if (thread.ok) setMessages(thread.messages ?? []);
      }
    }
    const interval = window.setInterval(() => {
      void refresh();
    }, 12_000);
    function onFocus() {
      void refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [selectedId]);

  const onSelect = useCallback(
    (id: string | null) => {
      if (id) {
        setConversations((current) =>
          current.map((item) => (item.id === id ? { ...item, unread_count: 0 } : item))
        );
        router.push(conversationPath(id), { scroll: false });
        return;
      }
      router.push("/messages", { scroll: false });
    },
    [router]
  );

  async function onSend(body: string) {
    if (!selectedId) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: `local-${crypto.randomUUID()}`,
      conversation_id: selectedId,
      sender_id: viewerId,
      body,
      image_url: null,
      created_at: new Date().toISOString(),
      seen: false
    };
    setMessages((current) => [...current, optimistic]);
    const result = await sendMessageRequest(selectedId, body);
    if (result.ok && result.message) {
      setMessages((current) =>
        current.map((item) => (item.id === optimistic.id ? result.message! : item))
      );
      setConversations((current) =>
        sortConversations(
          current.map((item) =>
            item.id === selectedId
              ? {
                  ...item,
                  last_message: body.slice(0, 140),
                  last_message_at: result.message!.created_at,
                  unread_count: 0
                }
              : item
          )
        )
      );
    } else {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
    }
    setSending(false);
  }

  async function onStartConversation(peer: MessagePeer) {
    const result = await startConversationRequest({
      peer_id: peer.id,
      trueverse_id: peer.trueverse_id
    });
    if (result.status === 401) {
      router.push(`/auth/login?next=${encodeURIComponent("/messages")}`);
      return;
    }
    if (result.id) router.push(conversationPath(result.id), { scroll: false });
  }

  return (
    <MessengerShell
      viewerId={viewerId}
      conversations={conversations}
      messages={messages}
      selectedId={selectedId}
      onSelect={onSelect}
      onSend={onSend}
      onStartConversation={onStartConversation}
      sending={sending}
      className={className}
    />
  );
}
