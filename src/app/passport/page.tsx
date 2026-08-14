import type { Metadata } from "next";
import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { buildLivePassportViewModel } from "@/lib/passport";
import { PassportOwnerV2 } from "@/components/passport/passport-owner-v2";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Passport",
  description: "Your Trueverse digital identity and reputation passport."
};

export default async function PassportPage() {
  const { supabase, user, profile } = await requireProfile();

  const [{ data: xpRow }, { data: trustActs }] = await Promise.all([
    supabase
      .from("user_xp")
      .select("total_xp")
      .eq("profile_id", profile.id)
      .maybeSingle<{ total_xp: number }>(),
    supabase
      .from("positive_interactions")
      .select(
        "id, title, description, status, author_id, recipient_id, created_at, accepted_at"
      )
      .or(`author_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .order("created_at", { ascending: false })
      .limit(40)
  ]);

  const emailVerified = Boolean(user.email_confirmed_at);
  const passport = buildLivePassportViewModel(profile, {
    emailVerified,
    totalXp: xpRow?.total_xp ?? 0,
    trustActs: trustActs ?? []
  });

  const needsUsername = !profile.username;

  return (
    <div className="space-y-8">
      <div className="mx-auto flex max-w-lg flex-wrap items-center justify-between gap-3 sm:max-w-3xl">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Digital reputation
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Passport
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your portable Trueverse identity — earned in public, proud to share.
          </p>
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

      <PassportOwnerV2 passport={passport} emailVerified={emailVerified} />
    </div>
  );
}
