"use client";

import Link from "next/link";
import { helpRequests } from "@/lib/dummy-data";
import { scoreToTrustLevel } from "@/lib/design";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";

export default function CommunityPage() {
  return (
    <MotionPage className="mx-auto max-w-lg space-y-6">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Community</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          People asking for help nearby. Offer support. Build verified reputation.
        </p>
      </MotionItem>

      <div className="space-y-4">
        {helpRequests.map((request) => (
          <MotionCard key={request.id} className="glass rounded-[1.75rem] p-5">
            <div className="flex items-start gap-3">
              <UserAvatar name={request.profiles?.full_name ?? "Member"} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{request.profiles?.full_name}</p>
                  {request.profiles ? (
                    <TrustLevelBadge
                      level={scoreToTrustLevel(request.profiles.trust_score)}
                      showLabel={false}
                    />
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{request.location}</p>
                <h2 className="mt-3 font-display text-xl font-bold tracking-tight">{request.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{request.description}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm">Offer help</Button>
                  <Button size="sm" variant="ghost">
                    Follow
                  </Button>
                </div>
              </div>
            </div>
          </MotionCard>
        ))}
      </div>

      {helpRequests.length === 0 ? (
        <MotionItem className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">It&apos;s quiet here</p>
          <p className="mt-2 text-sm text-muted-foreground">Be the first to ask for or offer help.</p>
          <Button asChild className="mt-5">
            <Link href="/feed">Open help feed</Link>
          </Button>
        </MotionItem>
      ) : null}
    </MotionPage>
  );
}
