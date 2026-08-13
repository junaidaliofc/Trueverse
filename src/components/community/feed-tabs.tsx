"use client";

import { MapPin } from "lucide-react";
import type { CommunityFeedTab } from "@/lib/community";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: CommunityFeedTab; label: string; disabled?: boolean }> = [
  { id: "for_you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "latest", label: "Latest" },
  { id: "nearby", label: "Nearby", disabled: true }
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
      className="flex gap-1 overflow-x-auto rounded-2xl bg-muted/50 p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={tab.disabled}
            title={tab.disabled ? "Nearby coming soon — location not required yet" : undefined}
            onClick={() => {
              if (!tab.disabled) onChange(tab.id);
            }}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
              tab.disabled && "cursor-not-allowed opacity-55"
            )}
          >
            {tab.id === "nearby" ? <MapPin className="size-3.5" /> : null}
            {tab.label}
            {tab.disabled ? (
              <span className="text-[9px] font-bold uppercase tracking-wide">Soon</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
