import { notFound } from "next/navigation";
import { buildPassportViewModel, profiles } from "@/lib/dummy-data";
import { findProfileByPublicSlug } from "@/lib/passport";
import { PUBLIC_PROFILE_DISCLAIMER, TRUST_LEVEL_META } from "@/lib/design";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { PassportSharePanel } from "@/components/passport/passport-share-panel";
import { UserAvatar } from "@/components/ui/user-avatar";

/**
 * Milestone 3 — Share surface with link + QR for a public Passport.
 */
export default async function SharePassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = findProfileByPublicSlug(profiles, username);
  if (!profile) notFound();

  const passport = buildPassportViewModel(profile, { mode: "public" });
  const levelMeta = TRUST_LEVEL_META[passport.trustLevel];

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Share Passport
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Portable identity card
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Send a privacy-respecting link or QR — Apple Wallet energy, not a dashboard export.
        </p>
      </header>

      <section className="glass-elevated overflow-hidden rounded-[2rem]">
        <div className="relative bg-[linear-gradient(155deg,#0f3f3a_0%,#123f3a_50%,#0b2e2a_100%)] px-6 py-8 text-accent-foreground">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={passport.displayName}
              src={passport.profile.photo_url}
              size="lg"
              className="rounded-3xl ring-2 ring-white/20"
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-200/90">
                Trueverse
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">{passport.displayName}</h2>
              <p className="mt-0.5 font-mono text-xs text-teal-100/75">{passport.trueverseId}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <TrustLevelBadge
              level={passport.trustLevel}
              className="bg-white/15 text-white ring-1 ring-white/25"
            />
          </div>
          <p className="mt-3 text-sm text-teal-50/80">{levelMeta.label} trust level</p>
        </div>
      </section>

      <PassportSharePanel
        sharePath={passport.sharePath}
        displayName={passport.displayName}
        trueverseId={passport.trueverseId}
        absoluteOrigin="https://trueverse.app"
      />

      <p className="text-center text-xs leading-5 text-muted-foreground">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </div>
  );
}
