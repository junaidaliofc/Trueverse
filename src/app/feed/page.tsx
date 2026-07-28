import { helpRequests } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default function FeedPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Feed</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Public help requests</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Dummy-data feed showing requests, community responses, and public trust context.
          </p>
        </div>
        <button className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">New request</button>
      </div>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Create help request</h2>
        <div className="mt-5 grid gap-4">
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="What do you need?" />
          <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3" placeholder="Location" />
          <textarea
            className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Describe the request..."
          />
        </div>
      </section>

      <div className="space-y-5">
        {helpRequests.map((request) => (
          <article key={request.id} className="glass-card rounded-3xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{request.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {request.profiles?.full_name} · {request.location}
                </p>
              </div>
              {request.profiles ? <TrustScoreBadge score={request.profiles.trust_score} /> : null}
            </div>
            <p className="mt-4 text-slate-700">{request.description}</p>
            <div className="mt-5 space-y-3">
              {(request.community_responses ?? []).map((response) => (
                <div key={response.id} className="rounded-2xl bg-white/80 p-4">
                  <p className="text-sm text-slate-700">{response.message}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">
                    {response.profiles?.full_name} · {response.profiles?.trueverse_id}
                  </p>
                </div>
              ))}
              {(request.community_responses ?? []).length === 0 ? (
                <p className="rounded-2xl bg-white/70 p-4 text-sm text-slate-500">No responses yet.</p>
              ) : null}
            </div>
            <div className="mt-5 flex gap-3">
              <input
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                placeholder="Offer help..."
              />
              <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">Respond</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
