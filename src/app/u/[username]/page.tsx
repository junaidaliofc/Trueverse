import { notFound } from "next/navigation";
import {
  buildPassportViewModel,
  followingIds,
  profiles
} from "@/lib/dummy-data";
import {
  deriveV1Reputation,
  findProfileByPublicSlug,
  passportUsername
} from "@/lib/passport";
import { PUBLIC_PROFILE_DISCLAIMER, scoreToTrustLevel } from "@/lib/design";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { LivePassport } from "@/components/passport/live-passport";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type PublicProfileRow = Profile & {
  identity_verified?: boolean | null;
  trust_acts?: number | null;
  references_count?: number | null;
};

export default async function PublicPassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Bundled fictional demo Passports keep their richer showcase rendering.
  const demo = findProfileByPublicSlug(profiles, username) as Profile | undefined;
  if (demo) {
    const passport = buildPassportViewModel(demo, {
      mode: "public",
      privacy: {
        showDna: false,
        showVerifications: true,
        showBadges: true,
        showTimeline: true,
        showStatistics: true
      }
    });

    passport.profile = demo;
    passport.displayName = demo.full_name;
    passport.username = demo.username ?? demo.trueverse_id.replace(/^tv_/, "");
    passport.sharePath = `/u/${passport.username}`;
    passport.trueverseId = demo.trueverse_id;
    passport.bio = demo.bio;
    passport.trustLevel = scoreToTrustLevel(demo.trust_score);
    passport.verifications = passport.verifications.filter(
      (item) => item.kind !== "organization"
    );

    const isCurrent = demo.id === "user-aria";

    return (
      <div className="space-y-4">
        <TrueversePassport
          passport={passport}
          mode="public"
          initialFollowing={!isCurrent && followingIds.includes(demo.id)}
        />
        <p className="mx-auto max-w-lg pb-8 text-center text-xs leading-5 text-muted-foreground sm:max-w-3xl">
          {PUBLIC_PROFILE_DISCLAIMER}
        </p>
      </div>
    );
  }

  // Real Trueverse members — truthful, trust-focused Passport only.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) notFound();

  let profile: PublicProfileRow | undefined;
  try {
    const supabase = await createSupabaseServerClient();
    const key = decodeURIComponent(username).replace(/^@/, "").toLowerCase();
    const { data } = await supabase
      .from("profiles")
      .select(
        "id,full_name,username,photo_url,bio,trueverse_id,created_at,identity_verified,trust_acts,references_count"
      )
      .or(`username.eq.${key},trueverse_id.eq.${key},trueverse_id.eq.tv_${key}`)
      .eq("is_disabled", false)
      .maybeSingle<PublicProfileRow>();
    profile = data ?? undefined;
  } catch {
    profile = undefined;
  }

  if (!profile) notFound();

  const identityVerified = Boolean(profile.identity_verified);
  const verifiedInteractions = profile.trust_acts ?? 0;
  const references = profile.references_count ?? 0;
  const reputation = deriveV1Reputation({
    accountVerified: identityVerified,
    verifiedInteractions
  });

  const uname = passportUsername(profile);
  const handle = profile.username
    ? `@${profile.username.replace(/^@/, "")}`
    : profile.trueverse_id;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  return (
    <LivePassport
      mode="public"
      displayName={profile.full_name || "Trueverse Member"}
      handle={handle}
      photoUrl={profile.photo_url}
      bio={profile.bio}
      memberSince={memberSince}
      accountVerified={identityVerified}
      identityVerified={identityVerified}
      reputation={reputation}
      verifiedInteractions={verifiedInteractions}
      references={references}
      publicPath={`/u/${uname}`}
      sharePath={`/u/${uname}/share`}
      startInteractionHref="/interactions/create"
      reportHref="/interactions/create"
    />
  );
}
