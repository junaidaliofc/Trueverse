"use client";

import Link from "next/link";
import {
  Award,
  Bell,
  Flame,
  Heart,
  Sparkles,
  Target,
  Shield
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/lib/dummy-data";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

const meta: Record<
  NotificationType,
  { icon: typeof Heart; tone: string; label: string }
> = {
  appreciation: { icon: Heart, tone: "bg-danger-soft text-danger", label: "Appreciation" },
  mission: { icon: Target, tone: "bg-xp-soft text-xp", label: "Mission" },
  trust: { icon: Shield, tone: "bg-brand-soft text-brand", label: "Trust" },
  badge: { icon: Award, tone: "bg-success-soft text-success", label: "Badge" },
  recap: { icon: Sparkles, tone: "bg-muted text-foreground", label: "Recap" },
  streak: { icon: Flame, tone: "bg-xp-soft text-xp", label: "Streak" },
  xp: { icon: Sparkles, tone: "bg-xp-soft text-xp", label: "XP" }
};

export function NotificationCenter({ items }: { items: NotificationItem[] }) {
  const unread = items.filter((item) => !item.read);

  return (
    <MotionPage className="mx-auto max-w-lg space-y-6">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {unread.length > 0 ? `${unread.length} new for you` : "You're all caught up"}
        </p>
      </MotionItem>

      {items.length === 0 ? (
        <MotionItem className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
            <Bell className="size-6" />
          </div>
          <p className="mt-5 font-display text-lg font-bold">Nothing yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Appreciations, missions, badges, and weekly recaps will land here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard">Back home</Link>
          </Button>
        </MotionItem>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const config = meta[item.type] ?? meta.xp;
            const Icon = config.icon;
            return (
              <MotionCard
                key={item.id}
                className={cn(
                  "glass rounded-[1.5rem] p-4",
                  item.read ? "opacity-80" : "ring-1 ring-primary/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl",
                      config.tone
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      {!item.read ? <StatusBadge tone="brand">New</StatusBadge> : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {config.label} · {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </div>
              </MotionCard>
            );
          })}
        </div>
      )}
    </MotionPage>
  );
}
