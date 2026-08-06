"use client";

import { buildPassportViewModel, currentUser } from "@/lib/dummy-data";
import { TrueversePassport } from "@/components/passport/trueverse-passport";

/**
 * Milestone 3 — Trueverse Passport (owner view).
 * Premium digital identity — not a settings page or dashboard.
 */
export default function ProfilePage() {
  const passport = buildPassportViewModel(currentUser, { mode: "owner" });

  return <TrueversePassport passport={passport} mode="owner" />;
}
