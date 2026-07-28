import { adminReports, profiles } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Admin dashboard</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Trust operations</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Verify evidence-backed reports, review disputes, and manage users from a single
          moderation console.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <Metric label="Reports waiting" value={adminReports.length} />
        <Metric label="Managed users" value={profiles.length} />
        <Metric label="Disputes open" value={1} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          {adminReports.map((report) => (
            <article key={report.id} className="glass-card rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-rose-700">Evidence report</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">{report.title}</h2>
                  <p className="mt-3 max-w-3xl text-slate-600">{report.description}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                  {report.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reporter</p>
                  <p className="mt-2 font-black text-slate-950">
                    {report.reporter?.full_name} · {report.reporter?.trueverse_id}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reported user</p>
                  <p className="mt-2 font-black text-slate-950">
                    {report.reported_user?.full_name} · {report.reported_user?.trueverse_id}
                  </p>
                </div>
              </div>

              <textarea
                className="mt-5 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                placeholder="Admin notes..."
                defaultValue={report.admin_notes ?? ""}
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-2xl bg-rose-600 px-5 py-3 font-bold text-white">Approve -5</button>
                <button className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">Reject</button>
                <button className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">
                  Mark disputed
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Recent users</h2>
          <div className="mt-5 space-y-3">
            {profiles.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 p-4">
                <div>
                  <p className="font-bold text-slate-950">{user.full_name || "Unnamed member"}</p>
                  <p className="font-mono text-xs text-slate-500">{user.trueverse_id}</p>
                </div>
                <TrustScoreBadge score={user.trust_score} />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-bold uppercase tracking-wide text-teal-200">Audit trail</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Lena reviewed report-missed-dropoff</p>
              <p>System queued receipt dispute</p>
              <p>Trust score event ledger synced</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
