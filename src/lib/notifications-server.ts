import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sortNotifications,
  type AppNotification,
  type NotificationCategory,
  type NotificationEventKey
} from "@/lib/notifications";

type NotificationRow = {
  id: string;
  category: NotificationCategory | null;
  event_key: string | null;
  title: string;
  body: string;
  href: string | null;
  actor_id: string | null;
  created_at: string;
  read_at: string | null;
  deleted_at: string | null;
};

function asEventKey(value: string | null): NotificationEventKey {
  switch (value) {
    case "appreciation":
    case "follow":
    case "reply":
    case "comment":
    case "message":
    case "trust_accepted":
    case "weekly_summary":
    case "mention":
    case "community_event":
    case "verification_approved":
    case "trust":
      return value;
    default:
      return "system";
  }
}

function asCategory(value: string | null): NotificationCategory {
  if (value === "messages") return "messages";
  if (value === "trust" || value === "system") return "trust";
  return "social";
}

export async function fetchNotifications(
  supabase: SupabaseClient,
  viewerId: string
): Promise<{ notifications: AppNotification[]; error?: string }> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, category, event_key, title, body, href, actor_id, created_at, read_at, deleted_at")
    .eq("recipient_id", viewerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) return { notifications: [], error: error.message };

  const rows = (data ?? []) as NotificationRow[];
  const actorIds = rows.map((row) => row.actor_id).filter((id): id is string => Boolean(id));
  const { data: actors } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, photo_url, trueverse_id")
        .in("id", actorIds)
    : { data: [] as Array<{ id: string; full_name: string; photo_url: string | null; trueverse_id: string }> };

  const actorMap = new Map(
    ((actors ?? []) as Array<{
      id: string;
      full_name: string;
      photo_url: string | null;
      trueverse_id: string;
    }>).map((actor) => [actor.id, actor])
  );

  const notifications: AppNotification[] = rows.map((row) => {
    const actor = row.actor_id ? actorMap.get(row.actor_id) : undefined;
    return {
      id: row.id,
      category: asCategory(row.category),
      event_key: asEventKey(row.event_key),
      title: row.title,
      body: row.body,
      href: row.href,
      actor_name: actor?.full_name ?? null,
      actor_trueverse_id: actor?.trueverse_id ?? null,
      actor_photo: actor?.photo_url ?? null,
      created_at: row.created_at,
      read: Boolean(row.read_at)
    };
  });

  return { notifications: sortNotifications(notifications) };
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  viewerId: string,
  id: string
) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", viewerId)
    .is("deleted_at", null);
}

export async function markAllNotificationsRead(supabase: SupabaseClient, viewerId: string) {
  return supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", viewerId)
    .is("read_at", null)
    .is("deleted_at", null);
}

export async function deleteNotification(
  supabase: SupabaseClient,
  viewerId: string,
  id: string
) {
  return supabase
    .from("notifications")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", viewerId);
}
