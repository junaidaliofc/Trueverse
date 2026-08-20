"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { peerTrustLevel, type ConversationView } from "@/lib/messages";
import { cn, formatRelativeTime } from "@/lib/utils";

export function ConversationCard({
  conversation,
  active,
  onSelect
}: {
  conversation: ConversationView;
  active?: boolean;
  onSelect: (id: string) => void;
}) {
  const unread = conversation.unread_count > 0;
  const time = conversation.last_message_at
    ? formatRelativeTime(conversation.last_message_at)
    : "";

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors",
        active ? "bg-brand-soft/80" : "hover:bg-muted/70",
        unread && !active && "bg-muted/40"
      )}
      aria-current={active ? "page" : undefined}
    >
      <UserAvatar name={conversation.peer.full_name} src={conversation.peer.photo_url} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm text-foreground",
                unread ? "font-bold" : "font-semibold"
              )}
            >
              {conversation.peer.full_name}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {conversation.peer.trueverse_id}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {time ? (
              <span className="text-[11px] font-medium text-muted-foreground">{time}</span>
            ) : null}
            {unread ? (
              <span
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground"
                aria-label={`${conversation.unread_count} unread`}
              >
                {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <TrustLevelBadge level={peerTrustLevel(conversation.peer)} showLabel={false} />
        </div>
        <p
          className={cn(
            "mt-1.5 line-clamp-1 text-sm",
            unread ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {conversation.last_message || "No messages yet"}
        </p>
      </div>
    </button>
  );
}
