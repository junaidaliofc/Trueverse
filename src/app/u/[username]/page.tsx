import { notFound } from "next/navigation";
import {
  buildPassportViewModel,
  followingIds,
  profiles
} from "@/lib/dummy-data";
import { findProfileByPublicSlug } from "@/lib/passport";
import { PUBLIC_PROFILE_DISCLAIMER, scoreToTrustLevel } from "@/lib/design";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function PublicPassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  let profile = findProfileByPublicSlug(profiles, username) as Profile | undefined;

  if (!profile && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createSupabaseServerClient();
      const key = decodeURIComponent(username).replace(/^@/, "").toLowerCase();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.eq.${key},trueverse_id.eq.${key},trueverse_id.eq.tv_${key}`)
        .eq("is_disabled", false)
        .maybeSingle<Profile>();
      profile = data ?? undefined;
    } catch {
      profile = undefined;
    }
  }

  if (!profile) notFound();

  const passport = buildPassportViewModel(profile, {
    mode: "public",
    privacy: {
      showDna: false,
      showVerifications: true,
      showBadges: true,
      showTimeline: true,
      showStatistics: true
    }
  });

  passport.profile = profile;
  passport.displayName = profile.full_name;
  passport.username =
    profile.username ?? profile.trueverse_id.replace(/^tv_/, "");
  passport.sharePath = `/u/${passport.username}`;
  passport.trueverseId = profile.trueverse_id;
  passport.bio = profile.bio;
  passport.trustLevel = scoreToTrustLevel(profile.trust_score);
  passport.verifications = passport.verifications.filter(
    (item) => item.kind !== "organization"
  );

  const isCurrent = profile.id === "user-aria";

  return (
    <div className="space-y-4">
      <TrueversePassport
        passport={passport}
        mode="public"
        initialFollowing={!isCurrent && followingIds.includes(profile.id)}
      />
      <p className="mx-auto max-w-lg pb-8 text-center text-xs leading-5 text-muted-foreground sm:max-w-3xl">
        {PUBLIC_PROFILE_DISCLAIMER}
      </p>
    </div>
  );
}
