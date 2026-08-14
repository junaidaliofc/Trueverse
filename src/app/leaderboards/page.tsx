"use client";

import { useState } from "react";
import Link from "next/link";
import { leaderboards } from "@/lib/dummy-data";
import { MotionItem, MotionPage } from "@/components/motion/primitives";
import { Surface } from "@/components/ui/surface";
import { FollowButton } from "@/components/social/follow-button";
import { TrueverseIdLink } from "@/components/identity/member-links";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "city", label: "City" },
  { id: "weekly", label: "Weekly" },
  { id: "friends", label: "Friends" },
  { id: "all", label: "All time" }
] as const;

/**
 * Optional rankings by XP / participation.
 * Product Bible: leaderboards are never trust rankings.
 */
export default function LeaderboardsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("weekly");
  const rows =
    tab === "weekly" || tab === "friends"
      ? tab === "friends"
        ? leaderboards.weekly.slice(0, 2)
        : leaderboards.weekly
      : leaderboards.city;

  return (
    <MotionPage className="mx-auto max-w-lg space-y-6">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Leaderboards</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Optional celebration of participation XP. Rankings never represent Trust Level.
        </p>
      </MotionItem>

      <MotionItem className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </MotionItem>

      <MotionItem>
        <Surface elevated className="overflow-hidden p-0">
          <ol>
            {rows.map((row, index) => (
              <li
                key={row.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5",
                  index < rows.length - 1 && "border-b border-border"
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted font-display text-sm font-bold">
                  {row.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${String(row.id).replace(/^tv_/, "")}`} className="font-semibold hover:underline">
                    {row.name}
                  </Link>
                  <TrueverseIdLink id={String(row.id)} className="text-xs" />
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-xp">{row.score}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    XP
                  </p>
                </div>
                <FollowButton trueverseId={row.id} size="sm" />
              </li>
            ))}
          </ol>
        </Surface>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Scores reflect XP and participation only — not trustworthiness.
        </p>
      </MotionItem>
    </MotionPage>
  );
}
