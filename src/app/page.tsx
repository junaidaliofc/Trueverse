import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HelpRequest } from "@/lib/types";
import { HelpRequestCard } from "@/components/feed";
import { ProfileCard } from "@/components/profile-card";

export default async function Home() {
  const profile = await getCurrentProfile();
  const supabase = await createSupabaseServerClient();
  const { data: requests } = await supabase
    .from("help_requests")
    .select(
      "*, profiles(full_name, photo_url, trust_score, trueverse_id), community_responses(*, profiles(full_name, photo_url, trust_score, trueverse_id))"
    )
    .eq("is_open", true)
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<HelpRequest[]>();

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-700">
            Digital trust for real-world interactions
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Build reputation through verified help, accountability, and community trust.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Trueverse gives people a portable reputation: positive interactions increase trust after
            recipient acceptance, while negative reports require evidence and admin review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={profile ? "/interactions" : "/auth/signup"}
              className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-teal-700"
            >
              {profile ? "Submit interaction" : "Create your profile"}
            </Link>
            <Link
              href="/feed"
              className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:border-teal-500"
            >
              View community feed
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="grid gap-4">
            {[
              ["Positive accepted", "+3 trust score"],
              ["Evidence-backed report", "Admin review required"],
              ["Approved negative report", "-5 trust score"],
              ["Community help", "Public feed and responses"]
            ].map(([title, value]) => (
              <div key={title} className="rounded-3xl bg-white/80 p-5">
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {profile ? <ProfileCard profile={profile} /> : null}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Community feed</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Recent help requests</h2>
          </div>
          <Link href="/feed" className="font-bold text-teal-700 hover:text-teal-900">
            See all
          </Link>
        </div>
        <div className="grid gap-5">
          {(requests ?? []).map((request) => (
            <HelpRequestCard key={request.id} request={request} />
          ))}
        </div>
      </section>
    </div>
  );
}
