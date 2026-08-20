import { requireAdmin } from "@/lib/auth";
import { AdminTrustOsDashboard } from "@/components/admin/trust-os-dashboard";
import { fetchAdminNegativeReports, fetchAdminTrustOs } from "@/lib/trust-os-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [os, reportsRes] = await Promise.all([
    fetchAdminTrustOs(supabase),
    fetchAdminNegativeReports(supabase)
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {os.error && !os.error.toLowerCase().includes("does not exist") ? (
        <p className="rounded-[1.25rem] bg-danger-soft px-4 py-3 text-sm text-danger">{os.error}</p>
      ) : null}
      <AdminTrustOsDashboard
        acts={os.acts}
        reports={reportsRes.reports}
        communityReports={os.communityReports}
        flagged={os.flagged}
        appeals={os.appeals}
        audit={os.audit}
        analytics={os.analytics}
      />
    </div>
  );
}
