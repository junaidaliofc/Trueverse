import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { TrustActActions } from "@/components/interactions/trust-act-actions";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InteractionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: interaction } = await supabase
    .from("positive_interactions")
    .select("id, title, description, status, author_id, recipient_id, created_at, accepted_at, rejected_at")
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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            Trust Act
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
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
          <p className="mt-2 font-display text-xl font-bold capitalize">{interaction.status}</p>
        </div>
        <div className="glass rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Trust</p>
          <p className="mt-2 font-display text-xl font-bold">
            {interaction.status === "accepted" ? "In review" : "No change yet"}
          </p>
        </div>
        <div className="glass rounded-3xl p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Created</p>
          <p className="mt-2 text-sm font-semibold">{formatRelativeTime(interaction.created_at)}</p>
        </div>
      </section>

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
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Confirming sends this Trust Act to moderation. Trust updates only after approval.
            Declining leaves Trust unchanged.
          </p>
          <div className="mt-4">
            <TrustActActions interactionId={interaction.id} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
