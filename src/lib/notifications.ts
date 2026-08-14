export const NOTIFICATION_CATEGORIES = ["all", "social", "trust", "messages"] as const;

export type NotificationCategory = Exclude<(typeof NOTIFICATION_CATEGORIES)[number], "all">;
export type NotificationFilter = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationEventKey =
  | "appreciation"
  | "follow"
  | "reply"
  | "comment"
  | "message"
  | "trust_accepted"
  | "weekly_summary"
  | "mention"
  | "community_event"
  | "verification_approved"
  | "trust"
  | "system";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  event_key: NotificationEventKey;
  title: string;
  body: string;
  href: string | null;
  actor_name: string | null;
  actor_trueverse_id: string | null;
  actor_photo: string | null;
  created_at: string;
  read: boolean;
};

export function sortNotifications(items: AppNotification[]) {
  return [...items].sort((a, b) => {
    const unread = Number(!b.read) - Number(!a.read);
    if (unread !== 0) return unread;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function filterNotifications(items: AppNotification[], filter: NotificationFilter) {
  const sorted = sortNotifications(items);
  if (filter === "all") return sorted;
  return sorted.filter((item) => item.category === filter);
}

export function unreadCount(items: AppNotification[]) {
  return items.filter((item) => !item.read).length;
}
