import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { isMissingRelation } from "@/lib/messages";
import { fetchNotifications } from "@/lib/notifications-server";
import { NotificationCenter } from "@/components/notifications/notification-center";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Trueverse notifications — social, trust, community, and system."
};

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile();
  const { notifications, error } = await fetchNotifications(supabase, profile.id);
  const items = error && isMissingRelation(error) ? [] : notifications;

  return <NotificationCenter items={items} />;
}
