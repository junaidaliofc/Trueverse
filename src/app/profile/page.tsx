import Link from "next/link";
import {
  badges,
  currentUser,
  currentUserReputation,
  interactions,
  trustTimeline,
  userXp
} from "@/lib/dummy-data";
import { PRODUCT_DISCLAIMER } from "@/lib/design";
import { ProfileCard } from "@/components/profile/profile-card";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { XPProgress } from "@/components/xp/xp-progress";
import { PageHeader } from "@/components/ui/section";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const earned = badges.filter((badge) => badge.earned);
  const completion = 72;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Your Trueverse identity"
        description="Share verified reputation signals anywhere — dating, marketplaces, work, and communities."
        actions={
          <>
            <Link href={`/u/${currentUser.trueverse_id}`}>
              <Button variant="dark">Public preview</Button>
            </Link>
            <Link href={`/u/${currentUser.trueverse_id}/share`}>
              <Button variant="outline">Share & QR</Button>
            </Link>
          </>
        }
      />

      <ProfileCard profile={currentUser} xp={userXp.total_xp} streak={userXp.daily_streak} />

      <TrustReputationCard
        stats={{
          trustIndex: currentUserReputation.trustIndex,
          identityVerified: currentUserReputation.identityVerified,
          trustActs: currentUserReputation.trustActs,
          appreciations: currentUserReputation.appreciations,
          communityRank: currentUserReputation.communityRank
        }}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <ReputationDnaCard dna={currentUserReputation.dna} />
        <Card elevated>
          <XPProgress totalXp={userXp.total_xp} />
          <div className="mt-6">
            <Progress value={completion} label="Profile completion" />
            <p className="mt-3 text-xs text-muted-foreground">
              XP unlocks cosmetics, badges, themes, and achievements. XP never increases trust.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <Link href="/badges" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {earned.map((badge) => (
              <Badge key={badge.id} tone="success">
                {badge.name}
              </Badge>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent verified activities</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {interactions.map((interaction) => (
              <li key={interaction.id}>
                <Link
                  href={`/interactions/${interaction.id}`}
                  className="block rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50"
                >
                  <p className="font-semibold text-foreground">{interaction.title}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{interaction.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Reputation history</CardTitle>
            <CardDescription>Trust events are calculated server-side.</CardDescription>
          </div>
        </CardHeader>
        <ul className="space-y-3">
          {trustTimeline.map((item) => (
            <li
              key={`${item.title}-${item.date}`}
              className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50"
            >
              <div>
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
              <span className="font-bold text-brand">{item.delta}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-center text-xs leading-5 text-muted-foreground">{PRODUCT_DISCLAIMER}</p>
    </div>
  );
}
