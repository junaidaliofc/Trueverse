"use client";

import { Flame, MapPin, Sparkles, Users } from "lucide-react";
import type { CommunityFeedTab } from "@/lib/community";
import { cn } from "@/lib/utils";

const TABS: Array<{
  id: Extract<CommunityFeedTab, "for_you" | "following" | "nearby" | "trending">;
  label: string;
  icon: typeof Sparkles;
}> = [
  { id: "for_you", label: "For You", icon: Sparkles },
  { id: "following", label: "Following", icon: Users },
  { id: "nearby", label: "Nearby", icon: MapPin },
  { id: "trending", label: "Trending", icon: Flame }
];

export function CommunityFeedTabs({
  value,
  onChange
}: {
  value: CommunityFeedTab;
  onChange: (tab: CommunityFeedTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Community feed"
      className="flex gap-1 overflow-x-auto rounded-2xl bg-muted/55 p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
