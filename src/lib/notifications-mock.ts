import type { AppNotification, NotificationEventKey, NotificationCategory } from "@/lib/notifications";

function hoursAgo(hours: number) {
  const origin = Date.parse("2026-08-14T16:00:00.000Z");
  return new Date(origin - hours * 60 * 60 * 1000).toISOString();
}

function item(options: {
  id: string;
  category: NotificationCategory;
  event_key: NotificationEventKey;
  title: string;
  body: string;
  href: string;
  hours: number;
  read?: boolean;
  actor_name?: string;
  actor_trueverse_id?: string;
}): AppNotification {
  return {
    id: options.id,
    category: options.category,
    event_key: options.event_key,
    title: options.title,
    body: options.body,
    href: options.href,
    actor_name: options.actor_name ?? null,
    actor_trueverse_id: options.actor_trueverse_id ?? null,
    actor_photo: null,
    created_at: hoursAgo(options.hours),
    read: options.read ?? false
  };
}

export const mockNotifications: AppNotification[] = [
  item({
    id: "n-sarah-appreciate",
    category: "social",
    event_key: "appreciation",
    title: "Sarah appreciated your Trust Act.",
    body: "Sarah Kim appreciated the westside pantry coordination.",
    href: "/passport",
    hours: 1,
    actor_name: "Sarah Kim",
    actor_trueverse_id: "tv_sarahkim"
  }),
  item({
    id: "n-ahmed-follow",
    category: "social",
    event_key: "follow",
    title: "Ahmed followed you.",
    body: "Ahmed Hassan started following your Passport.",
    href: "/u/ahmedhassan",
    hours: 3,
    actor_name: "Ahmed Hassan",
    actor_trueverse_id: "tv_ahmedhassan"
  }),
  item({
    id: "n-emily-comment",
    category: "community",
    event_key: "comment",
    title: "Emily commented on your community post.",
    body: "“I can bring extra crates Saturday.”",
    href: "/community",
    hours: 5,
    actor_name: "Emily Cho",
    actor_trueverse_id: "tv_emilycho"
  }),
  item({
    id: "n-mention",
    category: "community",
    event_key: "mention",
    title: "Someone mentioned you.",
    body: "You were mentioned in a neighborhood update.",
    href: "/community",
    hours: 9
  }),
  item({
    id: "n-event",
    category: "community",
    event_key: "community_event",
    title: "Community event this weekend.",
    body: "Westside pantry run — Saturday afternoon.",
    href: "/community/discover",
    hours: 14,
    read: true
  }),
  item({
    id: "n-weekly",
    category: "system",
    event_key: "weekly_summary",
    title: "Your weekly reputation summary is ready.",
    body: "A calm recap of Trust Acts and community activity — XP is separate.",
    href: "/insights",
    hours: 26,
    read: true
  }),
  item({
    id: "n-verify",
    category: "trust",
    event_key: "verification_approved",
    title: "Your identity verification was approved.",
    body: "Email verification is complete on your Passport.",
    href: "/passport",
    hours: 40,
    read: true
  })
];
