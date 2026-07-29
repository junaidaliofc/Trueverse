"use client";

import { useState } from "react";
import Link from "next/link";
import { leaderboards } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "city", label: "City" },
  { id: "weekly", label: "Weekly" },
  { id: "friends", label: "Friends" },
  { id: "all", label: "All time" }
] as const;

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("city");
  const rows =
    tab === "weekly"
      ? leaderboards.weekly
      : tab === "friends"
        ? leaderboards.weekly.slice(0, 2)
        : leaderboards.city;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Leaderboards"
        title="Optional rankings"
        description="Celebrate community contribution. Rankings reflect XP and participation — not trust levels."
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === item.id
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card elevated className="overflow-hidden p-0">
        <ol>
          {rows.map((row, index) => (
            <li
              key={row.id}
              className={cn(
                "flex items-center gap-4 px-5 py-4",
                index < rows.length - 1 && "border-b border-border"
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted font-display text-sm font-bold">
                {row.rank}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/u/${row.id}`} className="font-semibold hover:underline">
                  {row.name}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{row.id}</p>
              </div>
              <span className="font-display text-lg font-bold text-xp">{row.score}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
