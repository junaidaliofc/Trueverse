import { badges, achievements } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle
} from "@/components/ui/surface";
import { StatusBadge } from "@/components/ui/status-badge";

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
            <Surface key={badge.id} className={badge.earned ? "" : "opacity-55"}>
              <SurfaceHeader>
                <div>
                  <SurfaceTitle>{badge.name}</SurfaceTitle>
                  <SurfaceDescription>{badge.description}</SurfaceDescription>
                </div>
                <StatusBadge tone={badge.earned ? "success" : "neutral"}>
                  {badge.earned ? "Earned" : "Locked"}
                </StatusBadge>
              </SurfaceHeader>
            </Surface>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Achievements</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map((item) => (
            <Surface key={item.id} className={item.unlocked ? "" : "opacity-55"}>
              <SurfaceHeader>
                <div>
                  <SurfaceTitle>{item.name}</SurfaceTitle>
                  <SurfaceDescription>{item.description}</SurfaceDescription>
                </div>
                <StatusBadge tone={item.unlocked ? "brand" : "neutral"}>
                  {item.unlocked ? "Unlocked" : "Locked"}
                </StatusBadge>
              </SurfaceHeader>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}
