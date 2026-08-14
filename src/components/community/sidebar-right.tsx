import Link from "next/link";
import type { Profile } from "@/lib/types";
import { UserAvatar } from "@/components/ui/user-avatar";
import { passportUsername } from "@/lib/passport";

export function CommunitySidebarRight({
  missionTitle,
  missionBody,
  suggested
}: {
  missionTitle: string;
  missionBody: string;
  suggested: Profile[];
}) {
  return (
    <aside className="space-y-4">
      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Today&apos;s mission
        </p>
        <h2 className="mt-2 font-display text-lg font-bold text-foreground">
          {missionTitle}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{missionBody}</p>
        <Link
          href="/dashboard"
          className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          View on Home
        </Link>
      </section>

      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Suggested people
        </p>
        {suggested.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Follow contributors as the community grows. No fake suggestions.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {suggested.slice(0, 4).map((person) => {
              const handle = passportUsername(person);
              return (
                <li key={person.id} className="flex items-center gap-3">
                  <UserAvatar
                    name={person.full_name}
                    src={person.photo_url}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/u/${handle}`}
                      className="truncate text-sm font-semibold text-foreground hover:underline"
                    >
                      {person.full_name || "Member"}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">@{handle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Trending topics
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>#NeighborhoodHelp</li>
          <li>#VolunteerDays</li>
          <li>#TrustActs</li>
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Topic ranking ships later from real post activity.
        </p>
      </section>

      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Coming up
        </p>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          <li>Messaging</li>
          <li>Marketplace</li>
          <li>Groups</li>
          <li>Events</li>
          <li>Business Profiles</li>
          <li>AI Assistant</li>
        </ul>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Architecture reserved — not shipping in this sprint.
        </p>
      </section>
    </aside>
  );
}
