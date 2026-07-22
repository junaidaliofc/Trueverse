import Image from "next/image";
import type { Profile } from "@/lib/types";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative size-24 overflow-hidden rounded-3xl bg-slate-200">
          {profile.photo_url ? (
            <Image src={profile.photo_url} alt={profile.full_name} fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-black text-slate-500">
              {(profile.full_name || "T").slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-slate-950">{profile.full_name || "Trueverse Member"}</h2>
            <TrustScoreBadge score={profile.trust_score} />
          </div>
          <p className="mt-1 font-mono text-sm text-slate-500">{profile.trueverse_id}</p>
          <p className="mt-3 max-w-2xl text-slate-600">{profile.bio || "No bio yet."}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-center text-white">
          <p className="text-3xl font-black">{profile.streak}</p>
          <p className="text-xs uppercase tracking-wide text-slate-300">streak</p>
        </div>
      </div>
    </section>
  );
}
