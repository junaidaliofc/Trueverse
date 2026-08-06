"use client";

import { notifications } from "@/lib/dummy-data";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function NotificationsPage() {
  return <NotificationCenter items={notifications} />;
}
