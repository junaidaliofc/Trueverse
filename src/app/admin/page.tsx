import { requireAdmin } from "@/lib/auth";
import { AdminReportQueue } from "@/components/admin-report-queue";
import type { AdminReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const { data: reports, error } = await supabase
    .from("negative_reports")
    .select("*")
    .in("status", ["pending", "under_review", "disputed"])
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Admin · Beta
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Report review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Evidence-backed reports only. Trust changes only after admin approval via the existing
          simple calculation.
        </p>
      </div>

      {error ? (
        <div className="glass rounded-[1.75rem] p-6 text-sm text-danger">{error.message}</div>
      ) : null}

      {!error && (reports?.length ?? 0) === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No reports waiting</p>
          <p className="mt-2 text-sm text-muted-foreground">The moderation queue is clear.</p>
        </div>
      ) : null}

      {reports && reports.length > 0 ? (
        <AdminReportQueue reports={reports as AdminReport[]} />
      ) : null}
    </div>
  );
}
