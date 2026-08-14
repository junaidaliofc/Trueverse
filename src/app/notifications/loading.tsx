import { NotificationListSkeleton } from "@/components/notifications/notification-center";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-lg space-y-6 sm:max-w-2xl">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Inbox</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Notifications
        </h1>
      </div>
      <NotificationListSkeleton />
    </div>
  );
}
