import Link from "next/link";
import { weeklyInsights, currentUser } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Link href={`/u/${currentUser.trueverse_id}`}>
            <Button variant="outline">Share profile</Button>
          </Link>
        }
      />

      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.label} elevated>
            <CardHeader>
              <div>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription className="mt-2 text-base text-foreground">
                  {item.value}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
