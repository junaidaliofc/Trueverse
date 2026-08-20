import { requireProfile } from "@/lib/auth";
import { AppealsPanel } from "@/components/trust/appeals-panel";
import { fetchMyAppeals } from "@/lib/trust-os-server";
import { isMissingRelation } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function AppealsPage() {
  const { supabase, profile } = await requireProfile();
  const { appeals, error } = await fetchMyAppeals(supabase, profile.id);
  const rows = error && isMissingRelation(error) ? [] : appeals;

  return (
    <div className="space-y-4">
      {error && !isMissingRelation(error) ? (
        <p className="mx-auto max-w-2xl rounded-[1.25rem] bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <AppealsPanel appeals={rows} />
    </div>
  );
}
