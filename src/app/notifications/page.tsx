import { requireUser } from "@/lib/auth";
import { NotificationCenter } from "@/components/notifications/notification-center";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireUser();
  return <NotificationCenter items={[]} />;
}
