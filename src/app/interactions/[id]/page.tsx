import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrustActActions } from "@/components/interactions/trust-act-actions";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  marketplace: "Marketplace",
  professional: "Professional",
  service: "Service",
  community: "Community",
  other: "Other"
};

function statusLabel(status: string): string {
  if (status === "accepted") return "Verified Interaction";
  if (status === "pending") return "Pending confirmation";
  if (status === "rejected") return "Declined";
  return "Expired";
}

export default async function InteractionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: interaction } = await supabase
    .from("positive_interactions")
    .select(
      "id, title, description, status, category, reputation_eligible, author_id, recipient_id, created_at, accepted_at, rejected_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!interaction) notFound();

  if (interaction.author_id !== user.id && interaction.recipient_id !== user.id) {
    notFound();
  }

  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name, trueverse_id, username")
    .in("id", [interaction.author_id, interaction.recipient_id]);

  const author = people?.find((p) => p.id === interaction.author_id);
  const recipient = people?.find((p) => p.id === interaction.recipient_id);
  const canReview =
    interaction.recipient_id === user.id && interaction.status === "pending";
  const categoryLabel = CATEGORY_LABELS[interaction.category ?? "other"] ?? "Other";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={interaction.status === "accepted" ? "success" : "neutral"}>
              {statusLabel(interaction.status)}
            </StatusBadge>
            <StatusBadge tone="neutral">{categoryLabel}</StatusBadge>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            {interaction.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{interaction.description}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/interactions">Back</Link>
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="glass rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-2 font-display text-lg font-bold">{statusLabel(interaction.status)}</p>
        </div>
        <div className="glass rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Reputation evidence
          </p>
          <p className="mt-2 font-display text-lg font-bold">
            {interaction.status === "accepted" ? "Counted" : "Not yet"}
          </p>
        </div>
        <div className="glass rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Created</p>
          <p className="mt-2 text-sm font-semibold">{formatRelativeTime(interaction.created_at)}</p>
        </div>
      </section>

      {interaction.status === "accepted" && interaction.reputation_eligible === false ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
          This confirmed interaction is recorded as verified evidence, but it did not add reputation
          credit — that is limited to one confirmation per person every 30 days.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">From</p>
          <p className="mt-2 font-semibold">{author?.full_name ?? "Member"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {author?.username ?? author?.trueverse_id}
          </p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">To</p>
          <p className="mt-2 font-semibold">{recipient?.full_name ?? "Member"}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {recipient?.username ?? recipient?.trueverse_id}
          </p>
        </div>
      </section>

      {canReview ? (
        <section className="glass rounded-3xl p-5">
          <h2 className="font-display text-xl font-bold">Your decision</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Confirm if this interaction occurred, or decline if it did not.
          </p>
          <div className="mt-4">
            <TrustActActions interactionId={interaction.id} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
