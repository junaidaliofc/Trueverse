import { requireAdmin } from "@/lib/auth";
import type { AdminDispute, AdminReport, Profile } from "@/lib/types";
import { AdminReportQueue } from "@/components/admin-report-queue";
import { AdminDisputeQueue } from "@/components/admin-dispute-queue";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: reports }, { data: disputes }, { data: users }] = await Promise.all([
    supabase
      .from("negative_reports")
      .select(
        "*, reporter:profiles!negative_reports_reporter_id_fkey(full_name, trueverse_id, trust_score), reported_user:profiles!negative_reports_reported_user_id_fkey(full_name, trueverse_id, trust_score)"
      )
      .in("status", ["pending", "disputed"])
      .order("created_at", { ascending: true })
      .returns<AdminReport[]>(),
    supabase
      .from("disputes")
      .select(
        "*, report:negative_reports(id, title, description, evidence_url, status, reported_user_id, reported_user:profiles!negative_reports_reported_user_id_fkey(full_name, trueverse_id, trust_score)), opener:profiles!disputes_opened_by_fkey(full_name, trueverse_id)"
      )
      .eq("status", "open")
      .order("created_at", { ascending: true })
      .returns<AdminDispute[]>(),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(12).returns<Profile[]>()
  ]);

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
        <Metric label="Reports waiting" value={(reports ?? []).length} />
        <Metric label="Open disputes" value={(disputes ?? []).length} />
        <Metric label="Managed users" value={(users ?? []).length} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-8">
          <AdminReportQueue reports={reports ?? []} />
          <AdminDisputeQueue disputes={disputes ?? []} />
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Recent users</h2>
          <div className="mt-5 space-y-3">
            {(users ?? []).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 p-4">
                <div>
                  <p className="font-bold text-slate-950">{user.full_name || "Unnamed member"}</p>
                  <p className="font-mono text-xs text-slate-500">{user.trueverse_id}</p>
                </div>
                <TrustScoreBadge score={user.trust_score} />
              </div>
            ))}
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
