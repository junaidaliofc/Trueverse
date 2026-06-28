import Link from "next/link";
import { currentUser, interactions, trustTimeline } from "@/lib/dummy-data";
import { ProfileCard } from "@/components/profile-card";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Profile</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Your Trueverse identity</h1>
        </div>
        <Link href={`/u/${currentUser.trueverse_id}`} className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">
          View public profile
        </Link>
      </div>

      <ProfileCard profile={currentUser} />

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="glass-card space-y-4 rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Edit profile</h2>
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" defaultValue={currentUser.full_name} />
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Photo URL" />
          <textarea
            className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            defaultValue={currentUser.bio}
          />
          <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">Save changes</button>
        </form>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Reputation history</h2>
          <div className="mt-5 space-y-4">
            {trustTimeline.map((item) => (
              <div key={`${item.title}-${item.date}`} className="flex items-center justify-between rounded-2xl bg-white/80 p-4">
                <div>
                  <p className="font-bold text-slate-950">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
                <span className="font-black text-teal-700">{item.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Recent interactions</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {interactions.map((interaction) => (
            <Link key={interaction.id} href={`/interactions/${interaction.id}`} className="rounded-2xl bg-white/80 p-4">
              <p className="font-black text-slate-950">{interaction.title}</p>
              <p className="mt-2 text-sm text-slate-600">{interaction.status}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
