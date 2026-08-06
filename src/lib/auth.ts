import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getSessionUser() {
  if (!hasSupabaseEnv()) {
    return { supabase: null, user: null };
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

export async function getCurrentProfile() {
  const { supabase, user } = await getSessionUser();

  if (!user || !supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return data;
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return { supabase, user, profile };
}
