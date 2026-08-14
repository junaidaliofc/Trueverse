"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { LabeledProgress } from "@/components/ui/progress-field";
import { cn } from "@/lib/utils";

export type DailyMissionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  completed: boolean;
  progress: number;
  target: number;
};

export function DailyMissionsCard({
  missions,
  className
}: {
  missions: DailyMissionItem[];
  className?: string;
}) {
  const completedCount = missions.filter((mission) => mission.completed).length;
  const overall =
    missions.length === 0 ? 0 : Math.round((completedCount / missions.length) * 100);

  return (
    <section className={cn("glass-elevated rounded-[1.85rem] p-5 sm:p-6", className)}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Daily missions
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            Today
          </h2>
          <p className="mt-1 text-sm text-foreground/80">
            {completedCount}/{missions.length} complete · XP only, never trust
          </p>
        </div>
      </div>

      <LabeledProgress value={overall} label="Daily progress" indicatorClassName="bg-xp" />

      <ul className="mt-5 space-y-3">
        {missions.map((mission) => (
          <li key={mission.id}>
            <Link
              href={mission.href}
              className="flex items-start gap-3 rounded-[1.25rem] bg-muted/35 px-3 py-3 ring-1 ring-border/40 transition-colors hover:bg-muted/55"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                  mission.completed
                    ? "bg-success-soft text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "font-semibold text-foreground",
                    mission.completed && "line-through opacity-80"
                  )}
                >
                  {mission.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-foreground/75">
                  {mission.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
