import Link from "next/link";
import { weeklyInsights, currentUser } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle
} from "@/components/ui/surface";
import { Button } from "@/components/ui/button";

export default function InsightsPage() {
  const items = [
    { label: "Trust signal", value: weeklyInsights.trust_delta },
    { label: "Most appreciated", value: weeklyInsights.most_appreciated },
    { label: "Profile tip", value: weeklyInsights.profile_suggestion },
    { label: "Recommended mission", value: weeklyInsights.recommended_mission },
    { label: "Community impact", value: weeklyInsights.community_impact }
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="AI Insights"
        title="Your weekly summary"
        description="Gentle guidance based on your verified activity and engagement — never a safety judgment."
        actions={
          <Button asChild variant="outline">
            <Link href={`/u/${currentUser.trueverse_id}`}>Share profile</Link>
          </Button>
        }
      />

      <div className="grid gap-4">
        {items.map((item) => (
          <Surface key={item.label} elevated>
            <SurfaceHeader>
              <div>
                <SurfaceTitle>{item.label}</SurfaceTitle>
                <SurfaceDescription className="mt-2 text-base text-foreground">
                  {item.value}
                </SurfaceDescription>
              </div>
            </SurfaceHeader>
          </Surface>
        ))}
      </div>
    </div>
  );
}
