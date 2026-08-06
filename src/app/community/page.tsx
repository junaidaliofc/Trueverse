"use client";

import Link from "next/link";
import { activities, helpRequests, peopleToFollow, followingIds } from "@/lib/dummy-data";
import { scoreToTrustLevel } from "@/lib/design";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "@/components/social/follow-button";
import { PeopleToFollow } from "@/components/social/people-to-follow";
import { ActivityFeedCard } from "@/components/social/activity-feed-card";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";

export default function CommunityPage() {
  const spotlight = activities.slice(0, 2);

  return (
    <MotionPage className="mx-auto max-w-lg space-y-8">
      <MotionItem>
        <h1 className="font-display text-3xl font-bold tracking-tight">Community</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Help nearby, follow contributors, and celebrate verified moments.
        </p>
      </MotionItem>

      <MotionItem>
        <PeopleToFollow people={peopleToFollow} />
      </MotionItem>

      <MotionItem className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight">Help requests</h2>
            <p className="mt-1 text-sm text-muted-foreground">Offer real-world support.</p>
          </div>
          <Link href="/activity" className="text-sm font-semibold text-primary">
            Activity
          </Link>
        </div>

        <div className="space-y-4">
          {helpRequests.map((request) => (
            <MotionCard key={request.id} className="glass rounded-[1.75rem] p-5">
              <div className="flex items-start gap-3">
                <UserAvatar name={request.profiles?.full_name ?? "Member"} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{request.profiles?.full_name}</p>
                      {request.profiles ? (
                        <TrustLevelBadge
                          level={scoreToTrustLevel(request.profiles.trust_score)}
                          showLabel={false}
                        />
                      ) : null}
                    </div>
                    {request.profiles ? (
                      <FollowButton
                        trueverseId={request.profiles.trueverse_id}
                        initialFollowing={followingIds.includes(request.author_id)}
                      />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{request.location}</p>
                  <h2 className="mt-3 font-display text-xl font-bold tracking-tight">
                    {request.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {request.description}
                  </p>
                  <div className="mt-4">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/interactions/create">Record Trust Act</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </MotionItem>

      <MotionItem className="space-y-3">
        <h2 className="font-display text-xl font-bold tracking-tight">From people you follow</h2>
        <div className="space-y-4">
          {spotlight.map((activity, index) => (
            <ActivityFeedCard
              key={activity.id}
              activity={activity}
              index={index}
              showFollow={false}
            />
          ))}
        </div>
      </MotionItem>
    </MotionPage>
  );
}
