import Link from "next/link";
import { currentUser, dashboardMetrics, helpRequests, interactions, trustTimeline } from "@/lib/dummy-data";
import { ProfileCard } from "@/components/profile-card";

export default function DashboardPage() {
  const pendingInteractions = interactions.filter((interaction) => interaction.status === "pending");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Dashboard</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Welcome back, Aria</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Track your reputation, respond to pending interactions, and see what your community
            needs next.
          </p>
        </div>
        <Link href="/interactions/create" className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">
          Create interaction
        </Link>
      </div>

      <ProfileCard profile={currentUser} />

      <section className="grid gap-5 md:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className="glass-card rounded-3xl p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{metric.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-600">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Pending actions</h2>
          <div className="mt-5 space-y-4">
            {pendingInteractions.map((interaction) => (
              <Link
                href={`/interactions/${interaction.id}`}
                key={interaction.id}
                className="block rounded-2xl bg-white/80 p-4"
              >
                <p className="font-black text-slate-950">{interaction.title}</p>
                <p className="mt-1 text-sm text-slate-600">{interaction.description}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-amber-700">
                  Waiting for acceptance
                </p>
              </Link>
            ))}
            <Link href="/admin" className="block rounded-2xl bg-rose-50 p-4 text-rose-900">
              <p className="font-black">1 evidence report needs admin review</p>
              <p className="mt-1 text-sm">Open the admin dashboard to review the queue.</p>
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Trust timeline</h2>
          <div className="mt-5 space-y-4">
            {trustTimeline.map((event) => (
              <div key={`${event.title}-${event.date}`} className="flex items-center gap-4 rounded-2xl bg-white/80 p-4">
                <span
                  className={`flex size-12 items-center justify-center rounded-2xl font-black ${
                    event.tone === "positive" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {event.delta}
                </span>
                <div>
                  <p className="font-bold text-slate-950">{event.title}</p>
                  <p className="text-sm text-slate-500">{event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Recommended help request</h2>
            <p className="mt-2 text-slate-600">{helpRequests[1].title}</p>
          </div>
          <Link href="/feed" className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">
            Browse feed
          </Link>
        </div>
      </section>
    </div>
  );
}
