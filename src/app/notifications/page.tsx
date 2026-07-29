"use client";

import Link from "next/link";
import { notifications } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";

export default function NotificationsPage() {
  const unread = notifications.filter((item) => !item.read);

  return (
    <MotionPage className="mx-auto max-w-lg space-y-6">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {unread.length > 0 ? `${unread.length} new for you` : "You're all caught up"}
        </p>
      </MotionItem>

      {notifications.length === 0 ? (
        <MotionItem className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">Nothing yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Appreciations, badges, and mission wins will show up here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard">Back home</Link>
          </Button>
        </MotionItem>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <MotionCard
              key={item.id}
              className={`glass rounded-[1.5rem] p-4 ${item.read ? "opacity-75" : "ring-1 ring-primary/20"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(item.created_at)}
                  </p>
                </div>
                {!item.read ? <StatusBadge tone="brand">New</StatusBadge> : null}
              </div>
            </MotionCard>
          ))}
        </div>
      )}
    </MotionPage>
  );
}
