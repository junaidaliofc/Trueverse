"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Calendar,
  AtSign,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  NOTIFICATION_CATEGORIES,
  filterNotifications,
  unreadCount,
  type AppNotification,
  type NotificationEventKey,
  type NotificationFilter
} from "@/lib/notifications";
import { passportHrefFromHandle } from "@/components/identity/member-links";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function RelativeTimestamp({ iso }: { iso: string }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  return <time dateTime={iso}>{mounted ? formatRelativeTime(iso) : iso.slice(0, 10)}</time>;
}

const EVENT_ICON: Record<NotificationEventKey, typeof Bell> = {
  appreciation: Heart,
  follow: UserPlus,
  comment: MessageCircle,
  mention: AtSign,
  community_event: Calendar,
  weekly_summary: Sparkles,
  verification_approved: ShieldCheck,
  trust: ShieldCheck,
  system: Bell
};

export function NotificationCenter({
  items,
  local = false
}: {
  items: AppNotification[];
  local?: boolean;
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [overrides, setOverrides] = useState<Record<string, { read?: boolean; removed?: boolean }>>(
    {}
  );
  const [pending, startTransition] = useTransition();
  const rows = items
    .filter((item) => !overrides[item.id]?.removed)
    .map((item) => ({ ...item, read: overrides[item.id]?.read ?? item.read }));

  const visible = filterNotifications(rows, filter);
  const unread = unreadCount(rows);

  function markRead(id: string) {
    setOverrides((current) => ({ ...current, [id]: { ...current[id], read: true } }));
    if (local) return;
    startTransition(async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    });
  }

  function markAll() {
    setOverrides((current) => {
      const next = { ...current };
      for (const item of items) next[item.id] = { ...next[item.id], read: true };
      return next;
    });
    if (local) return;
    startTransition(async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
    });
  }

  function remove(id: string) {
    setOverrides((current) => ({ ...current, [id]: { ...current[id], removed: true } }));
    if (local) return;
    startTransition(async () => {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 sm:max-w-2xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Inbox</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "You're all caught up."}
          </p>
        </div>
        {rows.length > 0 ? (
          <Button type="button" size="sm" variant="outline" disabled={pending || unread === 0} onClick={markAll}>
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        ) : null}
      </header>

      <div className="flex flex-wrap gap-1.5">
        {NOTIFICATION_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold capitalize tracking-wide",
              filter === item
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass-elevated rounded-[1.75rem] px-6 py-14 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <Bell className="size-6" />
          </span>
          <p className="mt-5 font-display text-lg font-bold text-foreground">Nothing here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Follows, comments, Trust Acts, and weekly summaries will land quietly here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((item) => {
            const Icon = EVENT_ICON[item.event_key];
            const actorHref = item.actor_trueverse_id
              ? passportHrefFromHandle(item.actor_trueverse_id)
              : null;
            return (
              <li
                key={item.id}
                className={cn(
                  "glass-elevated rounded-[1.5rem] p-4",
                  !item.read && "ring-1 ring-primary/25"
                )}
              >
                <div className="flex items-start gap-3">
                  {actorHref ? (
                    <UserAvatar
                      name={item.actor_name || item.title}
                      src={item.actor_photo}
                      size="md"
                      href={actorHref}
                    />
                  ) : (
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <Icon className="size-4" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={item.href || "/notifications"}
                      className="font-semibold text-foreground hover:text-primary"
                      onClick={() => markRead(item.id)}
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    <p className="mt-2 text-xs capitalize text-muted-foreground">
                      {item.category} · <RelativeTimestamp iso={item.created_at} />
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!item.read ? (
                        <Button type="button" size="xs" variant="secondary" onClick={() => markRead(item.id)}>
                          Mark as read
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function NotificationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="glass-elevated flex gap-3 rounded-[1.5rem] p-4">
          <Skeleton className="size-11 rounded-2xl bg-foreground/15" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-foreground/15" />
            <Skeleton className="h-3 w-full bg-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
