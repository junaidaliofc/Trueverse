"use client";

import { dailyMissions, missions } from "@/lib/dummy-data";
import { DailyMissions, MissionCard } from "@/components/missions/daily-missions";
import { MotionItem, MotionPage } from "@/components/motion/primitives";

export default function MissionsPage() {
  const weekly = missions.filter((mission) => mission.cadence === "weekly");

  return (
    <MotionPage className="mx-auto max-w-lg space-y-8">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Missions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Three daily missions keep the habit alive. Rewards are XP and badges — never trust.
        </p>
      </MotionItem>

      <MotionItem>
        <DailyMissions missions={dailyMissions} showContinue />
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
