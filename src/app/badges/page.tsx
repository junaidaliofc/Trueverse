import { badges, achievements } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BadgesPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Collection"
        title="Badges & achievements"
        description="Unlocked through XP progression and verified participation. Decorative — never used as trust."
      />

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Badges</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => (
            <Card key={badge.id} className={badge.earned ? "" : "opacity-55"}>
              <CardHeader>
                <div>
                  <CardTitle>{badge.name}</CardTitle>
                  <CardDescription>{badge.description}</CardDescription>
                </div>
                <Badge tone={badge.earned ? "success" : "neutral"}>
                  {badge.earned ? "Earned" : "Locked"}
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((item) => (
            <Card key={item.id} className={item.unlocked ? "" : "opacity-55"}>
              <CardHeader>
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <Badge tone={item.unlocked ? "brand" : "neutral"}>
                  {item.unlocked ? "Unlocked" : "Locked"}
                </Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
