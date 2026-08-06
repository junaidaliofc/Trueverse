import Link from "next/link";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import {
  buildPassportViewModel,
  currentUser,
  profiles
} from "@/lib/dummy-data";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { scoreToTrustLevel } from "@/lib/design";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  await requireUser();
  const liveProfile = await getCurrentProfile();

  const profile: Profile = liveProfile ?? currentUser;
  const demoMatch = profiles.find((item) => item.id === profile.id);
  const passport = buildPassportViewModel(demoMatch ?? profile, { mode: "owner" });

  // Prefer live editable fields on the passport hero.
  passport.profile = {
    ...passport.profile,
    ...profile,
    trust_score: profile.trust_score
  };
  passport.displayName = profile.full_name;
  passport.trueverseId = profile.trueverse_id;
  passport.username =
    profile.username ?? profile.trueverse_id.replace(/^tv_/, "");
  passport.sharePath = `/u/${passport.username}`;
  passport.bio = profile.bio;
  passport.trustLevel = scoreToTrustLevel(profile.trust_score);
  passport.identityVerified = Boolean(
    (profile as Profile & { identity_verified?: boolean }).identity_verified
  );

  const needsUsername = !profile.username;

  return (
    <div className="space-y-8">
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3 sm:max-w-3xl">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Beta · Passport
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Your private digital identity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/interactions/create">New Trust Act</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={passport.sharePath}>Public view</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      {needsUsername ? (
        <div className="mx-auto max-w-lg rounded-[1.5rem] bg-warning-soft px-4 py-3 text-sm text-warning sm:max-w-3xl">
          Choose a unique username below so people can find you at /u/yourname.
        </div>
      ) : null}

      <div className="mx-auto max-w-lg sm:max-w-3xl">
        <ProfileForm profile={profile} />
      </div>

      <TrueversePassport passport={passport} mode="owner" />
    </div>
  );
}
