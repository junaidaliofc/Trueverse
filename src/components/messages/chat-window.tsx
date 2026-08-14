"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/messages/message-composer";
import { TypingIndicator } from "@/components/messages/typing-indicator";
import { ChatThreadSkeleton } from "@/components/messages/messenger-skeletons";
import {
  formatLastSeen,
  formatMessageClock,
  peerHandle,
  peerTrustLevel,
  type ChatMessage,
  type ConversationView
} from "@/lib/messages";
import { cn } from "@/lib/utils";

export function ChatWindow({
  conversation,
  messages,
  viewerId,
  loading,
  sending,
  typingVisible,
  onBack,
  onSend
}: {
  conversation: ConversationView;
  messages: ChatMessage[];
  viewerId: string;
  loading?: boolean;
  sending?: boolean;
  typingVisible?: boolean;
  onBack: () => void;
  onSend: (body: string) => Promise<void> | void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastOwnId = [...messages].reverse().find((item) => item.sender_id === viewerId)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, typingVisible, conversation.id]);

  if (loading) return <ChatThreadSkeleton />;

  return (
    <section className="flex h-full min-h-0 flex-col" aria-label="Chat">
      <header className="flex items-center gap-3 border-b border-border/60 px-3 py-3 sm:px-4">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="md:hidden"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Link href={`/u/${peerHandle(conversation.peer)}`} className="shrink-0">
          <UserAvatar
            name={conversation.peer.full_name}
            src={conversation.peer.photo_url}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/u/${peerHandle(conversation.peer)}`}
              className="truncate font-semibold text-foreground hover:text-primary"
            >
              {conversation.peer.full_name}
            </Link>
            <TrustLevelBadge level={peerTrustLevel(conversation.peer)} />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {formatLastSeen(conversation.peer_last_read_at)}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const mine = message.sender_id === viewerId;
            return (
              <div
                key={message.id}
                className={cn("flex max-w-[82%] flex-col gap-1", mine ? "ml-auto items-end" : "mr-auto items-start")}
              >
                <div
                  className={cn(
                    "whitespace-pre-wrap rounded-[1.25rem] px-3.5 py-2.5 text-sm leading-6",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  )}
                >
                  {message.body}
                </div>
                <p
                  className={cn(
                    "px-1 text-[11px] text-muted-foreground",
                    mine ? "text-right" : "text-left"
                  )}
                >
                  {formatMessageClock(message.created_at)}
                  {mine && message.id === lastOwnId && message.seen ? " · Seen" : ""}
                </p>
              </div>
            );
          })}
          <TypingIndicator visible={typingVisible} name={conversation.peer.full_name} />
          <div ref={endRef} />
        </div>
      </div>

      <MessageComposer onSend={onSend} sending={sending} />
    </section>
  );
}
