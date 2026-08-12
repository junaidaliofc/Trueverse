import { notFound } from "next/navigation";
import {
  buildPassportViewModel,
  followingIds,
  profiles
} from "@/lib/dummy-data";
import {
  buildLivePassportViewModel,
  findProfileByPublicSlug,
  passportUsername
} from "@/lib/passport";
import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

const DEMO_SLUGS = new Set(["sarahkim", "tv_sarahkim"]);

export default async function PublicPassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const key = decodeURIComponent(username).replace(/^@/, "").toLowerCase();

  // Explicit demo profile only — never mix demo data into live accounts.
  if (DEMO_SLUGS.has(key)) {
    const demo = findProfileByPublicSlug(profiles, key) as Profile | undefined;
    if (!demo) notFound();

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
    passport.username = passportUsername(demo);
    passport.sharePath = `/u/${passport.username}`;
    passport.trueverseId = demo.trueverse_id;
    passport.bio = demo.bio;
    // Demo may show email as verified in dummy data; strip private email from display model.
    passport.verifications = passport.verifications
      .filter((item) => item.kind !== "organization")
      .map((item) =>
        item.kind === "email" || item.kind === "phone"
          ? { ...item, detail: item.status === "verified" ? "Verified" : undefined }
          : item
      );

    return (
      <div className="space-y-4">
        <TrueversePassport
          passport={passport}
          mode="public"
          emailVerified={false}
          initialFollowing={followingIds.includes(demo.id)}
        />
        <p className="mx-auto max-w-lg pb-8 text-center text-xs leading-5 text-muted-foreground sm:max-w-3xl">
          {PUBLIC_PROFILE_DISCLAIMER}
        </p>
      </div>
    );
  }

  let profile: Profile | undefined;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, full_name, photo_url, bio, trust_score, streak, trueverse_id, username, city, headline, interests, social_links, role, is_disabled, last_positive_at, created_at, updated_at"
        )
        .or(`username.eq.${key},trueverse_id.eq.${key},trueverse_id.eq.tv_${key}`)
        .eq("is_disabled", false)
        .maybeSingle<Profile>();
      profile = data ?? undefined;

      if (profile) {
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
            .eq("status", "accepted")
            .order("created_at", { ascending: false })
            .limit(20)
        ]);

        // Email verification is owner-only (requires auth session). Public view omits the email card.
        const passport = buildLivePassportViewModel(profile, {
          emailVerified: false,
          totalXp: xpRow?.total_xp ?? 0,
          trustActs: trustActs ?? []
        });
        passport.verifications = passport.verifications.filter((item) => item.kind !== "email");

        return (
          <div className="space-y-4">
            <TrueversePassport passport={passport} mode="public" emailVerified={false} />
            <p className="mx-auto max-w-lg pb-8 text-center text-xs leading-5 text-muted-foreground sm:max-w-3xl">
              {PUBLIC_PROFILE_DISCLAIMER}
            </p>
          </div>
        );
      }
    } catch {
      profile = undefined;
    }
  }

  notFound();
}
