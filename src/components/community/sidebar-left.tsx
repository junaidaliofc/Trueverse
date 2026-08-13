import Link from "next/link";
import type { Profile } from "@/lib/types";
import { TRUST_LEVEL_META, type TrustLevel } from "@/lib/design";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { passportUsername } from "@/lib/passport";

export function CommunitySidebarLeft({
  profile,
  trustLevel,
  xpLevel,
  streak
}: {
  profile: Profile;
  trustLevel: TrustLevel;
  xpLevel: number;
  streak: number;
}) {
  const meta = TRUST_LEVEL_META[trustLevel];
  const handle = passportUsername(profile);

  return (
    <aside className="space-y-4">
      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          Passport
        </p>
        <div className="mt-3 flex items-center gap-3">
          <UserAvatar
            name={profile.full_name || "Member"}
            src={profile.photo_url}
            size="md"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {profile.full_name || "Trueverse Member"}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{handle}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Trust</span>
            <TrustLevelBadge level={trustLevel} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">XP level</span>
            <span className="font-semibold tabular-nums text-foreground">{xpLevel}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Streak</span>
            <span className="font-semibold tabular-nums text-foreground">
              {streak} day{streak === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{meta.description}</p>
        <Link
          href="/passport"
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Open Passport
        </Link>
      </section>

      <section className="glass rounded-[1.6rem] p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Shortcuts
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/community/saved" className="font-semibold text-foreground hover:text-primary">
              Saved posts
            </Link>
          </li>
          <li>
            <Link href="/interactions/create" className="font-semibold text-foreground hover:text-primary">
              New Trust Act
            </Link>
          </li>
          <li>
            <Link href="/passport" className="font-semibold text-foreground hover:text-primary">
              Edit profile
            </Link>
          </li>
        </ul>
      </section>
    </aside>
  );
}
