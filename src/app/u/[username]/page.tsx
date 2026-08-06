import { notFound } from "next/navigation";
import {
  buildPassportViewModel,
  followingIds,
  profiles
} from "@/lib/dummy-data";
import { findProfileByPublicSlug } from "@/lib/passport";
import { TrueversePassport } from "@/components/passport/trueverse-passport";

/**
 * Milestone 3 — Public Trueverse Passport at /u/[username]
 * Respects section-level privacy settings.
 */
export default async function PublicPassportPage({
  params
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = findProfileByPublicSlug(profiles, username);

  if (!profile) {
    notFound();
  }

  const passport = buildPassportViewModel(profile, { mode: "public" });
  const isCurrent = profile.id === "user-aria";

  return (
    <TrueversePassport
      passport={passport}
      mode="public"
      initialFollowing={!isCurrent && followingIds.includes(profile.id)}
    />
  );
}
