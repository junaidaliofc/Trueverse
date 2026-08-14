"use client";

import { dailyMissions, missions } from "@/lib/dummy-data";
import { DailyMissionsCard } from "@/components/missions/daily-missions-card";
import { MissionCard } from "@/components/missions/daily-missions";
import { MotionItem, MotionPage } from "@/components/motion/primitives";

export default function MissionsPage() {
  const weekly = missions.filter((mission) => mission.cadence === "weekly");

  return (
    <MotionPage className="mx-auto max-w-lg space-y-8">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Missions</h1>
        <p className="mt-2 text-sm text-foreground/80">
          Daily missions give you a reason to return. Rewards are XP and badges — never trust.
        </p>
      </MotionItem>

      <MotionItem>
        <DailyMissionsCard
          missions={dailyMissions.map((mission) => ({
            id: mission.id,
            title: mission.title,
            description: mission.description,
            href: mission.href ?? "/community",
            completed: mission.completed,
            progress: mission.progress,
            target: mission.target
          }))}
        />
      </MotionItem>

      <MotionItem>
        <h2 className="mb-3 font-display text-xl font-bold tracking-tight">This week</h2>
        <ul className="space-y-3">
          {weekly.map((mission, index) => (
            <li key={mission.id}>
              <MissionCard mission={mission} index={index} />
            </li>
          ))}
        </ul>
      </MotionItem>
    </MotionPage>
  );
}
