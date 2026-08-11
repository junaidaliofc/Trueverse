import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";
import type { User, SupabaseClient } from "@supabase/supabase-js";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export type LiveProfile = Profile & {
  trust_index?: number | null;
  identity_verified?: boolean | null;
  trust_acts?: number | null;
  appreciations_count?: number | null;
  profile_completion_pct?: number | null;
};

export async function getSessionUser() {
  if (!hasSupabaseEnv()) {
    return { supabase: null as SupabaseClient | null, user: null as User | null };
  }

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSessionUser();

  if (!user || !supabase) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

function displayNameFromUser(user: User) {
  const meta = user.user_metadata ?? {};
  const name = (meta.name || meta.full_name || "") as string;
  return String(name).trim();
}

/** Ensure a profiles row exists for the auth user (id = auth.users.id). */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<LiveProfile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<LiveProfile>();

  if (existing) {
    const desiredName = displayNameFromUser(user);
    if (desiredName && (!existing.full_name || existing.full_name.trim() === "")) {
      const { data: updated } = await supabase
        .from("profiles")
        .update({ full_name: desiredName })
        .eq("id", user.id)
        .select("*")
        .single<LiveProfile>();
      if (updated) return updated;
    }
    return existing;
  }

  const fullName = displayNameFromUser(user);
  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? null,
      full_name: fullName
    })
    .select("*")
    .single<LiveProfile>();

  if (error || !created) {
    // Race with handle_new_user trigger — fetch again.
    const { data: again } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<LiveProfile>();
    if (again) return again;
    throw new Error(error?.message ?? "Unable to create profile.");
  }

  return created;
}

export async function requireProfile() {
  const { supabase, user } = await requireUser();
  const profile = await ensureProfile(supabase, user);
  return { supabase, user, profile };
}

export async function getCurrentProfile() {
  const { supabase, user } = await getSessionUser();
  if (!user || !supabase) return null;
  return ensureProfile(supabase, user);
}

export async function requireAdmin() {
  const { supabase, user, profile } = await requireProfile();

  if (profile.role !== "admin") {
    redirect("/");
  }

  return { supabase, user, profile };
}

/** Public trust index for UI (0–100). Prefer trust_index; never invent demo levels. */
export function profileTrustIndex(profile: LiveProfile) {
  if (typeof profile.trust_index === "number") {
    return Math.max(0, Math.min(100, profile.trust_index));
  }
  // Legacy trust_score is 0–1000; map coarsely only when trust_index missing.
  if (typeof profile.trust_score === "number" && profile.trust_score > 100) {
    return Math.max(0, Math.min(100, Math.round(profile.trust_score / 10)));
  }
  if (typeof profile.trust_score === "number") {
    return Math.max(0, Math.min(100, profile.trust_score));
  }
  return 15;
}
