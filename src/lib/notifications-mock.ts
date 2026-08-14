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
    id: "n-appreciate",
    category: "social",
    event_key: "appreciation",
    title: "Someone appreciated you.",
    body: "Sarah Kim appreciated your westside pantry Trust Act.",
    href: "/passport",
    hours: 1,
    actor_name: "Sarah Kim",
    actor_trueverse_id: "tv_sarahkim"
  }),
  item({
    id: "n-follow",
    category: "social",
    event_key: "follow",
    title: "Someone followed you.",
    body: "Ahmed Hassan started following your Passport.",
    href: "/u/ahmedhassan",
    hours: 3,
    actor_name: "Ahmed Hassan",
    actor_trueverse_id: "tv_ahmedhassan"
  }),
  item({
    id: "n-reply",
    category: "social",
    event_key: "reply",
    title: "Someone replied to your post.",
    body: "Emily Cho replied on your neighborhood update.",
    href: "/community",
    hours: 4,
    actor_name: "Emily Cho",
    actor_trueverse_id: "tv_emilycho"
  }),
  item({
    id: "n-comment",
    category: "social",
    event_key: "comment",
    title: "Someone commented.",
    body: "“I can bring extra crates Saturday.”",
    href: "/community",
    hours: 5,
    actor_name: "Emily Cho",
    actor_trueverse_id: "tv_emilycho"
  }),
  item({
    id: "n-message",
    category: "messages",
    event_key: "message",
    title: "Someone sent a message.",
    body: "Amira sent you a note about Saturday’s route.",
    href: "/messages",
    hours: 6,
    actor_name: "Amira Hassan",
    actor_trueverse_id: "tv_amirahassan"
  }),
  item({
    id: "n-trust-accepted",
    category: "trust",
    event_key: "trust_accepted",
    title: "Someone accepted your Trust Act.",
    body: "Omar Patel confirmed the help you recorded.",
    href: "/interactions",
    hours: 8,
    actor_name: "Omar Patel",
    actor_trueverse_id: "tv_omarpatel"
  }),
  item({
    id: "n-weekly",
    category: "trust",
    event_key: "weekly_summary",
    title: "Weekly Trust Summary.",
    body: "A calm recap of Trust Acts this week. XP stays separate.",
    href: "/insights",
    hours: 26,
    read: true
  })
];
