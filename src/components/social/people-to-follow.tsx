"use client";

import Link from "next/link";
import type { Profile } from "@/lib/types";
import { scoreToTrustLevel } from "@/lib/design";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { FollowButton } from "@/components/social/follow-button";
import { MotionCard } from "@/components/motion/primitives";

export function PeopleToFollow({ people }: { people: Profile[] }) {
  if (people.length === 0) {
    return (
      <div className="glass rounded-[1.75rem] px-5 py-8 text-center">
        <p className="font-display text-lg font-bold">You&apos;re well connected</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Follow more people as the community grows.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">People to follow</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Discovery only — following is not a trust signal.
        </p>
      </div>
      <ul className="space-y-3">
        {people.map((person) => (
          <MotionCard key={person.id} className="glass rounded-[1.5rem] p-4">
            <div className="flex items-center gap-3">
              <Link href={`/u/${person.trueverse_id.replace(/^tv_/, "")}`}>
                <UserAvatar name={person.full_name} src={person.photo_url} size="md" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/u/${person.trueverse_id.replace(/^tv_/, "")}`}
                  className="font-semibold hover:underline"
                >
                  {person.full_name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[10px] text-muted-foreground">{person.trueverse_id}</p>
                  <TrustLevelBadge level={scoreToTrustLevel(person.trust_score)} showLabel={false} />
                </div>
              </div>
              <FollowButton trueverseId={person.trueverse_id} initialFollowing={false} />
            </div>
          </MotionCard>
        ))}
      </ul>
    </section>
  );
}
