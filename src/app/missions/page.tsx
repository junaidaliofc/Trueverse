import { missions } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
          <Card key={mission.id} elevated>
            <CardHeader>
              <div>
                <CardTitle>{mission.title}</CardTitle>
                <CardDescription>{mission.description}</CardDescription>
              </div>
              <Badge tone={mission.completed ? "success" : "xp"}>+{mission.xp_reward} XP</Badge>
            </CardHeader>
            <Progress
              value={(mission.progress / mission.target) * 100}
              barClassName="bg-xp"
              label={`${mission.progress} / ${mission.target}`}
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
