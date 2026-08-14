"use client";

import {
  Award,
  BadgeCheck,
  Building2,
  Crown,
  HandHeart,
  Landmark,
  Lock,
  Shield,
  Sparkles,
  Store
} from "lucide-react";
import type { PassportBadgeCard } from "@/lib/passport-mock";
import { PASSPORT_EMPTY_STEPS } from "@/lib/passport-mock";
import { PassportGettingStarted } from "@/components/passport/passport-getting-started";
import { cn } from "@/lib/utils";

const BADGE_ICONS = {
  "verified-identity": BadgeCheck,
  "verified-business": Store,
  "community-leader": Crown,
  volunteer: HandHeart,
  moderator: Shield,
  organization: Landmark,
  founder: Building2,
  "early-member": Sparkles
} as const;

export function PassportBadgeBoard({
  badges,
  className
}: {
  badges: PassportBadgeCard[];
  className?: string;
}) {
  if (badges.length === 0) {
    return <PassportGettingStarted steps={PASSPORT_EMPTY_STEPS} className={className} />;
  }

  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Badges</p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
          Achievements
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Marks of participation. Badges never raise trust.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => {
          const Icon = BADGE_ICONS[badge.id as keyof typeof BADGE_ICONS] ?? Award;
          return (
            <li
              key={badge.id}
              className={cn(
                "glass-elevated rounded-[1.4rem] p-4 transition-transform duration-300 hover:-translate-y-0.5",
                !badge.earned && "opacity-70"
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-2xl",
                  badge.earned ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                )}
              >
                {badge.earned ? <Icon className="size-4" /> : <Lock className="size-4" />}
              </span>
              <p className="mt-3 text-sm font-semibold text-foreground">{badge.label}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{badge.description}</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {badge.earned ? "Unlocked" : "Locked"}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
