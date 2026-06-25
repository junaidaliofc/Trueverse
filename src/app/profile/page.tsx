import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { ProfileCard } from "@/components/profile-card";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />
      <ProfileForm profile={profile} />
    </div>
  );
}
