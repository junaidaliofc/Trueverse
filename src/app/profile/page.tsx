import { requireProfile } from "@/lib/auth";
import { deriveV1Reputation, passportUsername } from "@/lib/passport";
import { LivePassport } from "@/components/passport/live-passport";
import { ProfileForm } from "@/components/profile-form";
import { LogoutButton } from "@/components/auth/logout-button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { user, profile } = await requireProfile();

  const emailVerified = Boolean(user.email_confirmed_at);
  const identityVerified = Boolean(profile.identity_verified);
  const accountVerified = emailVerified || identityVerified;
  const verifiedInteractions = profile.trust_acts ?? 0;
  const references = (profile as { references_count?: number }).references_count ?? 0;
  const reputation = deriveV1Reputation({ accountVerified, verifiedInteractions });

  const username = passportUsername(profile);
  const handle = profile.username
    ? `@${profile.username.replace(/^@/, "")}`
    : profile.trueverse_id;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  const needsUsername = !profile.username;

  return (
    <div className="space-y-8">
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3 sm:max-w-2xl">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Beta · My Passport
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Your private digital identity.</p>
        </div>
        <LogoutButton />
      </div>

      <LivePassport
        mode="owner"
        displayName={profile.full_name || "Trueverse Member"}
        handle={handle}
        photoUrl={profile.photo_url}
        bio={profile.bio}
        memberSince={memberSince}
        accountVerified={accountVerified}
        identityVerified={identityVerified}
        reputation={reputation}
        verifiedInteractions={verifiedInteractions}
        references={references}
        publicPath={`/u/${username}`}
        sharePath={`/u/${username}/share`}
      />

      {needsUsername ? (
        <div className="mx-auto max-w-lg rounded-[1.5rem] bg-warning-soft px-4 py-3 text-sm text-warning sm:max-w-2xl">
          Choose a unique username below so people can find you at /u/yourname.
        </div>
      ) : null}

      <div className="mx-auto max-w-lg sm:max-w-2xl">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
