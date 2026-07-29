import Link from "next/link";
import { helpRequests } from "@/lib/dummy-data";
import { PageHeader } from "@/components/ui/section";
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle
} from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { scoreToTrustLevel } from "@/lib/design";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function CommunityPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Community"
        title="Help & collaboration"
        description="Follow people, offer help, and celebrate verified contributions together."
        actions={
          <Button asChild variant="outline">
            <Link href="/feed">Open help feed</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {helpRequests.map((request) => (
          <Surface key={request.id} elevated>
            <SurfaceHeader>
              <div className="flex items-start gap-3">
                <UserAvatar name={request.profiles?.full_name ?? "Member"} size="md" />
                <div>
                  <SurfaceTitle>{request.title}</SurfaceTitle>
                  <SurfaceDescription>
                    {request.profiles?.full_name} · {request.location}
                  </SurfaceDescription>
                </div>
              </div>
              {request.profiles ? (
                <TrustLevelBadge level={scoreToTrustLevel(request.profiles.trust_score)} showLabel={false} />
              ) : null}
            </SurfaceHeader>
            <p className="text-sm leading-6 text-muted-foreground">{request.description}</p>
            <div className="mt-5 flex gap-3">
              <Button size="sm">Offer help</Button>
              <Button size="sm" variant="ghost">
                Follow
              </Button>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
