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
import { getSessionUser } from "@/lib/auth";
import { TrueversePassport } from "@/components/passport/trueverse-passport";
import { LivePassport } from "@/components/passport/live-passport";
import { ReferenceForm } from "@/components/references/reference-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRelativeTime } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const REFERENCE_RELATIONSHIP_LABELS: Record<string, string> = {
  worked_together: "Worked together",
  bought_sold: "Bought / sold",
  professional: "Professional",
  community: "Community",
  other: "Other"
};

type ReferenceRow = {
  id: string;
  author_id: string;
  relationship: string;
  reliable: boolean;
  communicated_clearly: boolean;
  followed_through: boolean;
  would_interact_again: boolean;
  note: string | null;
  created_at: string;
};

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

  const supabase = await createSupabaseServerClient();

  const [{ count: referenceCount }, { data: referenceRows }, { user: viewer }] = await Promise.all([
    supabase
      .from("passport_references")
      .select("id", { count: "exact", head: true })
      .eq("subject_id", profile.id),
    supabase
      .from("passport_references")
      .select(
        "id, author_id, relationship, reliable, communicated_clearly, followed_through, would_interact_again, note, created_at"
      )
      .eq("subject_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(6),
    getSessionUser()
  ]);

  const references = (referenceRows ?? []) as ReferenceRow[];
  const referenceAuthorIds = Array.from(new Set(references.map((r) => r.author_id)));
  const { data: referenceAuthors } = referenceAuthorIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", referenceAuthorIds)
    : { data: [] as Array<{ id: string; full_name: string }> };
  const referenceAuthorName = new Map(
    (referenceAuthors ?? []).map((p) => [p.id, p.full_name || "A member"])
  );

  const identityVerified = Boolean(profile.identity_verified);
  const verifiedInteractions = profile.trust_acts ?? 0;
  const totalReferences = referenceCount ?? references.length;
  const reputation = deriveV1Reputation({
    accountVerified: identityVerified,
    verifiedInteractions
  });

  const uname = passportUsername(profile);
  const handle = profile.username
    ? `@${profile.username.replace(/^@/, "")}`
    : profile.trueverse_id;
  const displayName = profile.full_name || "Trueverse Member";
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  const canLeaveReference = Boolean(viewer && viewer.id !== profile.id);

  const referencesSection = (
    <section className="space-y-3">
      <h2 className="px-1 font-display text-lg font-bold tracking-tight">
        References {totalReferences > 0 ? `(${totalReferences})` : ""}
      </h2>
      {references.length === 0 ? (
        <div className="glass rounded-2xl px-5 py-6 text-center text-sm text-muted-foreground">
          No references yet.
        </div>
      ) : (
        references.map((reference) => {
          const signals = [
            reference.reliable ? "Reliable" : null,
            reference.communicated_clearly ? "Communicated clearly" : null,
            reference.followed_through ? "Followed through" : null,
            reference.would_interact_again ? "Would interact again" : null
          ].filter(Boolean) as string[];
          return (
            <div key={reference.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">
                  {referenceAuthorName.get(reference.author_id) ?? "A member"}
                </span>
                <StatusBadge tone="neutral">
                  {REFERENCE_RELATIONSHIP_LABELS[reference.relationship] ?? "Other"}
                </StatusBadge>
              </div>
              {signals.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {signals.map((signal) => (
                    <StatusBadge key={signal} tone="brand">
                      {signal}
                    </StatusBadge>
                  ))}
                </div>
              ) : null}
              {reference.note ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{reference.note}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {formatRelativeTime(reference.created_at)}
              </p>
            </div>
          );
        })
      )}
      {canLeaveReference ? (
        <ReferenceForm subjectTrueverseId={profile.trueverse_id} subjectName={displayName} />
      ) : null}
    </section>
  );

  return (
    <LivePassport
      mode="public"
      displayName={displayName}
      handle={handle}
      photoUrl={profile.photo_url}
      bio={profile.bio}
      memberSince={memberSince}
      accountVerified={identityVerified}
      identityVerified={identityVerified}
      reputation={reputation}
      verifiedInteractions={verifiedInteractions}
      references={totalReferences}
      publicPath={`/u/${uname}`}
      sharePath={`/u/${uname}/share`}
      startInteractionHref={`/interactions/create?to=${encodeURIComponent(uname)}`}
      reportHref="/interactions/create"
      extra={referencesSection}
    />
  );
}
