import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { TrustActActions } from "@/components/interactions/trust-act-actions";
import { formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type InteractionRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  author_id: string;
  recipient_id: string;
  created_at: string;
};

export default async function InteractionsPage() {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("positive_interactions")
    .select("id, title, description, status, author_id, recipient_id, created_at")
    .or(`author_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as InteractionRow[];
  const profileIds = Array.from(
    new Set(rows.flatMap((row) => [row.author_id, row.recipient_id]))
  );

  const { data: profileRows } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, trueverse_id, username")
        .in("id", profileIds)
    : { data: [] as Array<{ id: string; full_name: string; trueverse_id: string; username: string | null }> };

  const profilesById = new Map((profileRows ?? []).map((p) => [p.id, p]));

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">History</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Trust Acts</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accepted acts update trust with the existing simple calculation. Pending acts wait for
            the recipient.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/interactions/create">New Trust Act</Link>
        </Button>
      </div>

      {error ? (
        <div className="glass rounded-[1.75rem] p-6 text-sm text-danger">
          Unable to load Trust Acts: {error.message}
        </div>
      ) : null}

      {!error && rows.length === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No Trust Acts yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit a positive Trust Act for someone you helped in the real world.
          </p>
          <Button asChild className="mt-5">
            <Link href="/interactions/create">Create Trust Act</Link>
          </Button>
        </div>
      ) : null}

      <ul className="space-y-4">
        {rows.map((item) => {
          const isRecipient = item.recipient_id === user.id;
          const pending = item.status === "pending";
          const author = profilesById.get(item.author_id);
          const recipient = profilesById.get(item.recipient_id);
          return (
            <li key={item.id} className="glass rounded-[1.75rem] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {item.status}
                    {item.status === "accepted" ? " · trust updated" : ""}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    From {author?.full_name ?? "Member"} → {recipient?.full_name ?? "Member"}
                    {" · "}
                    {formatRelativeTime(item.created_at)}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/interactions/${item.id}`}>Open</Link>
                </Button>
              </div>
              {isRecipient && pending ? (
                <div className="mt-4 border-t border-border/60 pt-4">
                  <TrustActActions interactionId={item.id} />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
