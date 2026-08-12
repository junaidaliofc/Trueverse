import { notFound } from "next/navigation";
import { buildPassportViewModel, profiles } from "@/lib/dummy-data";
import {
  buildLivePassportViewModel,
  findProfileByPublicSlug,
  passportUsername
} from "@/lib/passport";
import { PUBLIC_PROFILE_DISCLAIMER, TRUST_LEVEL_META } from "@/lib/design";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { PassportSharePanel } from "@/components/passport/passport-share-panel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

const DEMO_SLUGS = new Set(["sarahkim", "tv_sarahkim"]);

/**
 * Share surface with link + QR for a public Passport.
 */
export default async function SharePassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const key = decodeURIComponent(username).replace(/^@/, "").toLowerCase();

  let displayName = "";
  let trueverseId = "";
  let photoUrl: string | null = null;
  let sharePath = "";
  let trustLevel: ReturnType<typeof buildLivePassportViewModel>["trustLevel"] = "emerging";

  if (DEMO_SLUGS.has(key)) {
    const profile = findProfileByPublicSlug(profiles, key);
    if (!profile) notFound();
    const passport = buildPassportViewModel(profile, { mode: "public" });
    displayName = passport.displayName;
    trueverseId = passport.trueverseId;
    photoUrl = passport.profile.photo_url;
    sharePath = passport.sharePath;
    trustLevel = passport.trustLevel;
  } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, photo_url, bio, trust_score, streak, trueverse_id, username, city, headline, interests, social_links, role, is_disabled, last_positive_at, created_at, updated_at"
      )
      .or(`username.eq.${key},trueverse_id.eq.${key},trueverse_id.eq.tv_${key}`)
      .eq("is_disabled", false)
      .maybeSingle<Profile>();

    if (!data) notFound();
    const passport = buildLivePassportViewModel(data, { emailVerified: false, totalXp: 0 });
    displayName = passport.displayName;
    trueverseId = passport.trueverseId;
    photoUrl = passport.profile.photo_url;
    sharePath = passport.sharePath;
    trustLevel = passport.trustLevel;
  } else {
    notFound();
  }

  const levelMeta = TRUST_LEVEL_META[trustLevel];
  const handle = passportUsername({
    trueverse_id: trueverseId,
    username: sharePath.replace(/^\/u\//, "")
  });

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Share Passport
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Portable identity card
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Send a privacy-respecting link or QR — Apple Wallet energy, not a dashboard export.
        </p>
      </header>

      <section className="glass-elevated overflow-hidden rounded-[2rem]">
        <div className="relative bg-[linear-gradient(155deg,#0f3f3a_0%,#123f3a_50%,#0b2e2a_100%)] px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={displayName}
              src={photoUrl}
              size="lg"
              className="rounded-3xl ring-2 ring-white/20"
            />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-teal-200/90">
                Trueverse
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">{displayName}</h2>
              <p className="mt-0.5 text-sm text-teal-100">@{handle}</p>
              <p className="mt-0.5 font-mono text-xs text-teal-100/75">{trueverseId}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <TrustLevelBadge
              level={trustLevel}
              className="bg-white/15 text-white ring-1 ring-white/25"
            />
          </div>
          <p className="mt-3 text-sm text-teal-50/80">{levelMeta.label} trust level</p>
        </div>
      </section>

      <PassportSharePanel
        sharePath={sharePath}
        displayName={displayName}
        trueverseId={trueverseId}
      />

      <p className="text-center text-xs leading-5 text-muted-foreground">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </div>
  );
}
