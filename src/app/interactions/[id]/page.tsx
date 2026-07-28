import Link from "next/link";
import { notFound } from "next/navigation";
import { interactions, profiles } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default async function InteractionDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const interaction = interactions.find((item) => item.id === id);

  if (!interaction) {
    notFound();
  }

  const author = profiles.find((profile) => profile.id === interaction.author_id);
  const recipient = profiles.find((profile) => profile.id === interaction.recipient_id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Interaction detail</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{interaction.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{interaction.description}</p>
        </div>
        <Link href="/interactions" className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">
          Back to interactions
        </Link>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        <Metric label="Status" value={interaction.status} />
        <Metric label="Score impact" value={interaction.status === "accepted" ? "+3" : "Pending"} />
        <Metric label="Expires" value={new Date(interaction.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {[["Submitted by", author], ["Recipient", recipient]].map(([label, profile]) => (
          <div key={label as string} className="glass-card rounded-3xl p-6">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label as string}</p>
            {profile && typeof profile !== "string" ? (
              <>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">{profile.full_name}</h2>
                    <p className="font-mono text-sm text-slate-500">{profile.trueverse_id}</p>
                  </div>
                  <TrustScoreBadge score={profile.trust_score} />
                </div>
                <p className="mt-4 text-slate-600">{profile.bio}</p>
              </>
            ) : null}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Timeline</h2>
          <div className="mt-5 space-y-4">
            {[
              ["Submitted", interaction.created_at],
              [interaction.status === "accepted" ? "Accepted" : "Awaiting acceptance", interaction.accepted_at ?? interaction.updated_at],
              ["Trust ledger", interaction.status === "accepted" ? "+3 score event created" : "No score event yet"]
            ].map(([title, detail]) => (
              <div key={title} className="rounded-2xl bg-white/80 p-4">
                <p className="font-black text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Review controls</h2>
          <p className="mt-2 text-slate-600">
            Dummy controls showing how a recipient would accept or reject a positive interaction.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">Accept +3</button>
            <button className="rounded-2xl border border-slate-300 px-5 py-3 font-bold text-slate-700">Reject</button>
            <button className="rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white">Open dispute</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black capitalize text-slate-950">{value}</p>
    </div>
  );
}
