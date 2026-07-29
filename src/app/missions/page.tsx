import { missions } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle
} from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";
import { LabeledProgress } from "@/components/ui/progress-field";

export default function MissionsPage() {
  const daily = missions.filter((mission) => mission.cadence === "daily");
  const weekly = missions.filter((mission) => mission.cadence === "weekly");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Missions"
        title="Daily & weekly goals"
        description="Complete missions to earn XP, badges, and profile cosmetics. Missions never change trust."
      />

      <MissionSection title="Today" items={daily} />
      <MissionSection title="This week" items={weekly} />
    </div>
  );
}

function MissionSection({
  title,
  items
}: {
  title: string;
  items: typeof missions;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((mission) => (
          <Surface key={mission.id} elevated>
            <SurfaceHeader>
              <div>
                <SurfaceTitle>{mission.title}</SurfaceTitle>
                <SurfaceDescription>{mission.description}</SurfaceDescription>
              </div>
              <StatusBadge tone={mission.completed ? "success" : "xp"}>
                +{mission.xp_reward} XP
              </StatusBadge>
            </SurfaceHeader>
            <LabeledProgress
              value={(mission.progress / mission.target) * 100}
              indicatorClassName="bg-xp"
              label={`${mission.progress} / ${mission.target}`}
            />
          </Surface>
        ))}
      </div>
    </section>
  );
}
