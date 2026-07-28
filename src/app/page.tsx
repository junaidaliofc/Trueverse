import Link from "next/link";
import { dashboardMetrics, helpRequests, profiles } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
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
              href="/auth/signup"
              className="rounded-2xl bg-teal-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-teal-700"
            >
              Create your profile
            </Link>
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-300 px-6 py-3 font-bold text-slate-700 hover:border-teal-500"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-6">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold text-teal-200">Live trust preview</p>
            <p className="mt-3 text-5xl font-black">86</p>
            <p className="mt-1 text-slate-300">Aria Morgan · tv_ariamorgan</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl bg-white/80 p-5">
                <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["Positive interactions", "Recipient accepted, +3 trust score"],
          ["Evidence-backed reports", "Admin reviewed, -5 only after approval"],
          ["Community feed", "Help requests with public trust context"]
        ].map(([title, description]) => (
          <div key={title} className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-3 text-slate-600">{description}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Trusted members</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">Reputation that travels with you</h2>
          </div>
          <Link href="/u/tv_mayachen" className="font-bold text-teal-700 hover:text-teal-900">
            View public profile
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {profiles.slice(1).map((profile) => (
            <Link key={profile.id} href={`/u/${profile.trueverse_id}`} className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{profile.full_name}</h3>
                  <p className="mt-1 font-mono text-xs text-slate-500">{profile.trueverse_id}</p>
                </div>
                <TrustScoreBadge score={profile.trust_score} />
              </div>
              <p className="mt-4 text-sm text-slate-600">{profile.bio}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Recent public request</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{helpRequests[0].title}</h2>
            <p className="mt-2 max-w-2xl text-slate-600">{helpRequests[0].description}</p>
          </div>
          <Link href="/feed" className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">
            Open feed
          </Link>
        </div>
      </section>
    </div>
  );
}
