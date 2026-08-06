import Link from "next/link";
import { notFound } from "next/navigation";
import {
  activities,
  badges,
  currentUserReputation,
  helpRequests,
  interactions,
  profiles
} from "@/lib/dummy-data";
import { PRODUCT_DISCLAIMER, scoreToTrustLevel } from "@/lib/design";
import { ProfileCard } from "@/components/profile/profile-card";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { PageHeader } from "@/components/ui/section";
import { Surface, SurfaceHeader, SurfaceTitle } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ trueverseId: string }>;
}) {
  const { trueverseId } = await params;
  const profile = profiles.find((item) => item.trueverse_id === trueverseId);

  if (!profile) {
    notFound();
  }

  const isCurrent = profile.id === "user-aria";
  const reputation = isCurrent
    ? currentUserReputation
    : {
        trustIndex: profile.trust_score,
        identityVerified: profile.trust_score >= 50,
        trustActs: Math.round(profile.trust_score * 1.8),
        appreciations: Math.round(profile.trust_score * 1.2),
        communityRank: profile.trust_score >= 80 ? "Top 5%" : "Top 20%",
        dna: {
          helping: Math.min(100, profile.trust_score + 20),
          reliability: Math.min(100, profile.trust_score + 8),
          communication: Math.min(100, profile.trust_score + 12),
          professionalism: Math.min(100, profile.trust_score - 5),
          safety: Math.min(100, profile.trust_score + 5),
          community: Math.min(100, profile.trust_score + 10),
          leadership: Math.max(20, profile.trust_score - 10)
        }
      };

  const publicInteractions = interactions.filter(
    (interaction) => interaction.author_id === profile.id || interaction.recipient_id === profile.id
  );
  const publicRequests = helpRequests.filter((request) => request.author_id === profile.id);
  const publicActivities = activities.filter((item) => item.actor_id === profile.id);
  const earnedBadges = isCurrent ? badges.filter((badge) => badge.earned) : badges.slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Public reputation"
        title={profile.full_name}
        description="Verified reputation signals for informed decisions — not a safety guarantee."
        actions={
          <>
            <Button asChild>
              <Link href={`/u/${profile.trueverse_id}/share`}>Share profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/interactions/create">Create interaction</Link>
            </Button>
          </>
        }
      />

      <ProfileCard profile={profile} />

      <TrustReputationCard
        stats={{
          trustIndex: reputation.trustIndex,
          level: scoreToTrustLevel(reputation.trustIndex),
          identityVerified: reputation.identityVerified,
          trustActs: reputation.trustActs,
          appreciations: reputation.appreciations,
          communityRank: reputation.communityRank
        }}
      />

      <ReputationDnaCard
        dna={reputation.dna}
        title="Reputation DNA"
        dimensions={["helping", "reliability", "communication", "leadership"]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface>
          <SurfaceHeader>
            <SurfaceTitle>Badges</SurfaceTitle>
          </SurfaceHeader>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <StatusBadge key={badge.id} tone="success">
                {badge.name}
              </StatusBadge>
            ))}
          </div>
        </Surface>

        <Surface>
          <SurfaceHeader>
            <SurfaceTitle>Recent activities</SurfaceTitle>
          </SurfaceHeader>
          <ul className="space-y-3">
            {publicActivities.length > 0
              ? publicActivities.map((item) => (
                  <li key={item.id} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
                    <p className="font-semibold text-foreground">{item.title}</p>
                  </li>
                ))
              : publicInteractions.slice(0, 3).map((item) => (
                  <li key={item.id} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
                    <p className="font-semibold text-foreground">{item.title}</p>
                  </li>
                ))}
            {publicRequests.map((request) => (
              <li key={request.id} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
                <p className="font-semibold text-foreground">{request.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{request.location}</p>
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      <p className="text-center text-xs leading-5 text-muted-foreground">{PRODUCT_DISCLAIMER}</p>
    </div>
  );
}
