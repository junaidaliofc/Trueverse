import Link from "next/link";
import { interactions, profiles } from "@/lib/dummy-data";
import { TrustScoreBadge } from "@/components/trust-score-badge";

export default function InteractionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Interactions</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">Trust activity</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Browse dummy positive interactions and evidence-backed report flows before connecting
            live APIs.
          </p>
        </div>
        <Link href="/interactions/create" className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">
          Create interaction
        </Link>
      </div>

      <section className="grid gap-5">
        {interactions.map((interaction) => {
          const author = profiles.find((profile) => profile.id === interaction.author_id);
          const recipient = profiles.find((profile) => profile.id === interaction.recipient_id);

          return (
            <Link key={interaction.id} href={`/interactions/${interaction.id}`} className="glass-card rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-teal-700">{interaction.status}</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">{interaction.title}</h2>
                  <p className="mt-2 max-w-3xl text-slate-600">{interaction.description}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">
                  {interaction.status === "accepted" ? "+3 applied" : "Awaiting acceptance"}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[["Submitted by", author], ["Recipient", recipient]].map(([label, profile]) => (
                  <div key={label as string} className="rounded-2xl bg-white/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label as string}</p>
                    {profile && typeof profile !== "string" ? (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="font-black text-slate-950">{profile.full_name}</p>
                        <TrustScoreBadge score={profile.trust_score} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
