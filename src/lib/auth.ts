import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUser() {
  const { supabase, user } = await getSessionUser();

  if (!user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

export async function getCurrentProfile() {
  const { supabase, user } = await getSessionUser();

  if (!user) {
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
