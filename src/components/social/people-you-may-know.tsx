import Link from "next/link";
import type { SuggestedPerson } from "@/lib/suggested-people";
import { UserAvatar } from "@/components/ui/user-avatar";
import { FollowButton } from "@/components/social/follow-button";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { TrueverseIdLink } from "@/components/identity/member-links";
import { passportUsername } from "@/lib/passport";
import { scoreToTrustLevel } from "@/lib/design";

export function PeopleYouMayKnow({ people }: { people: SuggestedPerson[] }) {
  if (!people.length) {
    return (
      <section className="glass-elevated rounded-[1.75rem] px-5 py-8 text-center">
        <p className="font-display text-lg font-bold text-foreground">People you may know</p>
        <p className="mt-2 text-sm text-foreground/80">
          Suggestions appear as the neighborhood grows.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
          People you may know
        </h2>
        <p className="mt-1 text-sm text-foreground/80">
          Same community, shared interests, and mutual trust — never a popularity list.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {people.map(({ profile, reasonLabel }) => {
          const href = `/u/${passportUsername(profile)}`;
          const score =
            profile.trust_score > 100 ? Math.round(profile.trust_score / 10) : profile.trust_score;
          return (
            <li key={profile.id} className="glass-elevated rounded-[1.5rem] p-4">
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={profile.full_name}
                  src={profile.photo_url}
                  size="md"
                  href={href}
                />
                <div className="min-w-0 flex-1">
                  <Link href={href} className="font-semibold text-foreground hover:text-primary">
                    {profile.full_name}
                  </Link>
                  <div className="mt-0.5">
                    <TrueverseIdLink id={profile.trueverse_id} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <TrustLevelBadge level={scoreToTrustLevel(score)} showLabel={false} />
                    <span className="text-[11px] font-medium text-foreground/75">
                      {reasonLabel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <FollowButton trueverseId={profile.trueverse_id} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
