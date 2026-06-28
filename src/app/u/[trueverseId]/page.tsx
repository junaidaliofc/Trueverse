import Link from "next/link";
import { notFound } from "next/navigation";
import { helpRequests, interactions, profiles } from "@/lib/dummy-data";
import { ProfileCard } from "@/components/profile-card";

export default async function PublicProfilePage({
  params
}: {
  params: Promise<{ trueverseId: string }>;
}) {
  const { trueverseId } = await params;
  const profile = profiles.find((item) => item.trueverse_id === trueverseId);

  if (!profile) {
    notFound();
  }

  const publicInteractions = interactions.filter(
    (interaction) => interaction.author_id === profile.id || interaction.recipient_id === profile.id
  );
  const publicRequests = helpRequests.filter((request) => request.author_id === profile.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-teal-700">Public profile</p>
          <h1 className="mt-2 text-4xl font-black text-slate-950">{profile.full_name}</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Public trust summary visible before real-world interactions.
          </p>
        </div>
        <Link href="/interactions/create" className="rounded-2xl bg-teal-600 px-5 py-3 font-bold text-white">
          Create interaction
        </Link>
      </div>

      <ProfileCard profile={profile} />

      <section className="grid gap-5 md:grid-cols-3">
        <Metric label="Trust score" value={profile.trust_score.toString()} />
        <Metric label="Streak" value={profile.streak.toString()} />
        <Metric label="Verified interactions" value={publicInteractions.length.toString()} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Public interactions</h2>
          <div className="mt-5 space-y-3">
            {publicInteractions.map((interaction) => (
              <Link key={interaction.id} href={`/interactions/${interaction.id}`} className="block rounded-2xl bg-white/80 p-4">
                <p className="font-black text-slate-950">{interaction.title}</p>
                <p className="mt-1 text-sm capitalize text-slate-500">{interaction.status}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-2xl font-black text-slate-950">Help requests</h2>
          <div className="mt-5 space-y-3">
            {publicRequests.length > 0 ? (
              publicRequests.map((request) => (
                <div key={request.id} className="rounded-2xl bg-white/80 p-4">
                  <p className="font-black text-slate-950">{request.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{request.location}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-white/80 p-4 text-sm text-slate-500">
                No public help requests in this prototype.
              </p>
            )}
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
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
