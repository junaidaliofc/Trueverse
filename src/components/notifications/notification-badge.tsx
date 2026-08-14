"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBadge({
  className,
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/notifications/unread-count");
        const payload = (await response.json()) as { unread?: number };
        if (!cancelled) setUnread(payload.unread ?? 0);
      } catch {
        if (!cancelled) setUnread(0);
      }
    }
    void load();
    const interval = window.setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (compact) {
    if (unread < 1) return null;
    return (
      <span
        className={cn(
          "absolute right-1.5 top-1 min-w-4 rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground",
          className
        )}
      >
        {unread > 9 ? "9+" : unread}
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex", className)}>
      <Bell className="size-4" />
      {unread > 0 ? (
        <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </span>
  );
}

