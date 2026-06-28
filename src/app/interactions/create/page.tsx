import Link from "next/link";
import { profiles } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default function CreateInteractionPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Create interaction</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Record real-world trust</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Prototype forms for positive recognition and evidence-backed negative reports.
          </p>
        </div>
        <Link href="/interactions" className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">
          View interactions
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="glass-card space-y-4 rounded-3xl p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Positive</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Submit positive interaction</h2>
            <p className="mt-2 text-sm text-slate-600">Recipient acceptance applies +3 trust score.</p>
          </div>
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Recipient Trueverse ID" />
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Interaction title" />
          <textarea
            className="min-h-36 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Describe what happened..."
          />
          <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">Send for acceptance</button>
        </form>

        <form className="glass-card space-y-4 rounded-3xl p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-rose-700">Negative</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">Submit evidence report</h2>
            <p className="mt-2 text-sm text-slate-600">Admin approval is required before -5 trust score.</p>
          </div>
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Reported Trueverse ID" />
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Report title" />
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Evidence URL or file" />
          <textarea
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Describe incident and evidence..."
          />
          <button className="rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white">Submit to admin review</button>
        </form>
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Suggested recipients</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {profiles.slice(1).map((profile) => (
            <div key={profile.id} className="rounded-2xl bg-white/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">{profile.full_name}</p>
                  <p className="font-mono text-xs text-slate-500">{profile.trueverse_id}</p>
                </div>
                <TrustScoreBadge score={profile.trust_score} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
