import Link from "next/link";
import { helpRequests } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { scoreToTrustLevel } from "@/lib/design";
import { Avatar } from "@/components/ui/avatar";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Community"
        title="Help & collaboration"
        description="Follow people, offer help, and celebrate verified contributions together."
        actions={
          <Link href="/feed">
            <Button variant="outline">Open help feed</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {helpRequests.map((request) => (
          <Card key={request.id} elevated>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar name={request.profiles?.full_name ?? "Member"} size="md" />
                <div>
                  <CardTitle>{request.title}</CardTitle>
                  <CardDescription>
                    {request.profiles?.full_name} · {request.location}
                  </CardDescription>
                </div>
              </div>
              {request.profiles ? (
                <TrustLevelBadge level={scoreToTrustLevel(request.profiles.trust_score)} showLabel={false} />
              ) : null}
            </CardHeader>
            <p className="text-sm leading-6 text-muted-foreground">{request.description}</p>
            <div className="mt-5 flex gap-3">
              <Button size="sm">Offer help</Button>
              <Button size="sm" variant="ghost">
                Follow
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
