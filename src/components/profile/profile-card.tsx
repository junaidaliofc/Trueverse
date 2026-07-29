import Link from "next/link";
import type { Profile } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { scoreToTrustLevel } from "@/lib/design";
import { cn } from "@/lib/utils";

export function ProfileCard({
  profile,
  href,
  className,
  streak,
  xp
}: {
  profile: Profile;
  href?: string;
  className?: string;
  streak?: number;
  xp?: number;
}) {
  const content = (
    <section className={cn("glass rounded-3xl p-5 sm:p-6", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar name={profile.full_name} src={profile.photo_url} size="lg" className="rounded-3xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {profile.full_name || "Trueverse Member"}
            </h2>
            <TrustLevelBadge level={scoreToTrustLevel(profile.trust_score)} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{profile.trueverse_id}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {profile.bio || "No bio yet."}
          </p>
        </div>
        <div className="flex gap-3 sm:flex-col">
          <div className="rounded-2xl bg-accent px-5 py-4 text-center text-accent-foreground">
            <p className="font-display text-2xl font-bold">{streak ?? profile.streak}</p>
            <p className="text-[10px] uppercase tracking-wide opacity-80">streak</p>
          </div>
          {typeof xp === "number" ? (
            <div className="rounded-2xl bg-xp-soft px-5 py-4 text-center text-xp ring-1 ring-xp/20">
              <p className="font-display text-2xl font-bold">{xp}</p>
              <p className="text-[10px] uppercase tracking-wide">XP</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform duration-200 hover:-translate-y-0.5">
        {content}
      </Link>
    );
  }

  return content;
}
