import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { buildLivePassportViewModel } from "@/lib/passport";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireProfile();

  const { data: xpRow } = await supabase
    .from("user_xp")
    .select("total_xp")
    .eq("profile_id", profile.id)
    .maybeSingle<{ total_xp: number }>();

  const passport = buildLivePassportViewModel(profile, {
    emailVerified: Boolean(user.email_confirmed_at),
    totalXp: xpRow?.total_xp ?? 0
  });

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
