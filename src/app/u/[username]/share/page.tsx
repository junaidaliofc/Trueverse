import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { profiles } from "@/lib/dummy-data";
import {
  findProfileByPublicSlug,
  passportUsername,
  PASSPORT_SIGNAL_DISCLAIMER
} from "@/lib/passport";
import { PassportSharePanel } from "@/components/passport/passport-share-panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type ShareProfileRow = Profile & { identity_verified?: boolean | null };

/**
 * Share surface — portable Passport link + QR for both bundled demo Passports
 * and real Trueverse members.
 */
export default async function SharePassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let profile = findProfileByPublicSlug(profiles, username) as ShareProfileRow | undefined;

  if (!profile && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createSupabaseServerClient();
      const key = decodeURIComponent(username).replace(/^@/, "").toLowerCase();
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,username,photo_url,trueverse_id,identity_verified")
        .or(`username.eq.${key},trueverse_id.eq.${key},trueverse_id.eq.tv_${key}`)
        .eq("is_disabled", false)
        .maybeSingle<ShareProfileRow>();
      profile = data ?? undefined;
    } catch {
      profile = undefined;
    }
  }

  if (!profile) notFound();

  const uname = passportUsername(profile);
  const sharePath = `/u/${uname}`;
  const displayName = profile.full_name || "Trueverse Member";
  const identityVerified = Boolean(profile.identity_verified);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Share Passport
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Portable identity card</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Send a privacy-respecting Passport link or QR. Private contact details stay private.
        </p>
      </header>

      <section className="glass-elevated overflow-hidden rounded-[2rem]">
        <div className="relative bg-[linear-gradient(155deg,#0f3f3a_0%,#123f3a_50%,#0b2e2a_100%)] px-6 py-8 text-accent-foreground">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={displayName}
              src={profile.photo_url}
              size="lg"
              className="rounded-3xl ring-2 ring-white/20"
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-200/90">
                Trueverse
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">{displayName}</h2>
              <p className="mt-0.5 font-mono text-xs text-teal-100/75">{profile.trueverse_id}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge
              className={
                identityVerified
                  ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30"
                  : "bg-white/10 text-teal-100/80"
              }
            >
              {identityVerified ? (
                <>
                  <BadgeCheck className="mr-1 size-3.5" aria-hidden />
                  Identity verified
                </>
              ) : (
                "Identity unverified"
              )}
            </StatusBadge>
          </div>
        </div>
      </section>

      <PassportSharePanel
        sharePath={sharePath}
        displayName={displayName}
        trueverseId={profile.trueverse_id}
      />

      <p className="text-center text-xs leading-5 text-muted-foreground">
        {PASSPORT_SIGNAL_DISCLAIMER}
      </p>
    </div>
  );
}
