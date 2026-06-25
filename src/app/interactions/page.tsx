import { requireUser } from "@/lib/auth";
import type { PositiveInteraction } from "@/lib/types";
import { NegativeReportForm, PositiveInteractionForm } from "@/components/interaction-forms";

export default async function InteractionsPage() {
  const { supabase, user } = await requireUser();
  const { data: pending } = await supabase
    .from("positive_interactions")
    .select("*")
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .returns<PositiveInteraction[]>();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Trust workflows</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Interactions</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Positive interactions require recipient acceptance before +3 trust is applied. Negative
          interactions require evidence and admin approval before -5 trust is applied.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <PositiveInteractionForm />
        <NegativeReportForm />
      </section>

      <section className="glass-card rounded-3xl p-6">
        <h2 className="text-2xl font-black text-slate-950">Pending positive interactions</h2>
        <div className="mt-5 space-y-4">
          {(pending ?? []).length === 0 ? (
            <p className="text-slate-600">No positive interactions are waiting for you.</p>
          ) : (
            pending?.map((interaction) => (
              <PendingInteraction key={interaction.id} interaction={interaction} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function PendingInteraction({ interaction }: { interaction: PositiveInteraction }) {
  return (
    <form
      action={`/api/interactions/positive/${interaction.id}/accept`}
      method="post"
      className="rounded-2xl bg-white/80 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{interaction.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{interaction.description}</p>
        </div>
        <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700">
          Accept +3
        </button>
      </div>
    </form>
  );
}
