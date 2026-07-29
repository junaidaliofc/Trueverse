import { notifications } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Surface } from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRelativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Appreciations, badges, missions, trust updates, and weekly summaries."
      />

      <div className="space-y-3">
        {notifications.map((item) => (
          <Surface
            key={item.id}
            className={item.read ? "opacity-80" : "ring-1 ring-brand/25"}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatRelativeTime(item.created_at)}
                </p>
              </div>
              {!item.read ? <StatusBadge tone="brand">New</StatusBadge> : null}
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
