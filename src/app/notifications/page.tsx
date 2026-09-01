import { requireUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { TrustActActions } from "@/components/interactions/trust-act-actions";
import { Bell, ShieldCheck, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  marketplace: "Marketplace",
  professional: "Professional",
  service: "Service",
  community: "Community",
  other: "Other"
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  worked_together: "Worked together",
  bought_sold: "Bought / sold",
  professional: "Professional",
  community: "Community",
  other: "Other"
};

type PendingRow = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  author_id: string;
  created_at: string;
};

type ReferenceRow = {
  id: string;
  author_id: string;
  relationship: string;
  note: string | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
};

export default async function RequestsPage() {
  const { supabase, user } = await requireUser();

  const [{ data: pendingData }, { data: referenceData }, { data: notificationData }] =
    await Promise.all([
      supabase
        .from("positive_interactions")
        .select("id, title, description, category, author_id, created_at")
        .eq("recipient_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("passport_references")
        .select("id, author_id, relationship, note, created_at")
        .eq("subject_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("notifications")
        .select("id, type, title, body, created_at")
        .eq("recipient_id", user.id)
        .in("type", ["positive_interaction_accepted", "negative_report_reviewed", "dispute_updated"])
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

  const pending = (pendingData ?? []) as PendingRow[];
  const references = (referenceData ?? []) as ReferenceRow[];
  const notifications = (notificationData ?? []) as NotificationRow[];

  const actorIds = Array.from(
    new Set([
      ...pending.map((row) => row.author_id),
      ...references.map((row) => row.author_id)
    ])
  );

  const { data: actorRows } = actorIds.length
    ? await supabase.from("profiles").select("id, full_name, username, trueverse_id").in("id", actorIds)
    : { data: [] as Array<{ id: string; full_name: string; username: string | null; trueverse_id: string }> };

  const actorsById = new Map((actorRows ?? []).map((p) => [p.id, p]));
  const actorName = (id: string) => actorsById.get(id)?.full_name || "A member";

  const totalOpen = pending.length;
  const isEmpty =
    pending.length === 0 && references.length === 0 && notifications.length === 0;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Requests</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {totalOpen > 0
            ? `${totalOpen} interaction${totalOpen > 1 ? "s" : ""} awaiting your confirmation`
            : "Confirmations, references, and verification updates land here."}
        </p>
      </div>

      {isEmpty ? (
        <div className="glass rounded-[1.75rem] px-6 py-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
            <Bell className="size-6" aria-hidden />
          </div>
          <p className="mt-5 font-display text-lg font-bold">You&rsquo;re all caught up</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Interaction confirmations and references will appear here.
          </p>
        </div>
      ) : null}

      {pending.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-bold tracking-tight">
            Pending confirmations
          </h2>
          {pending.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="warning">Confirm interaction</StatusBadge>
                <StatusBadge tone="neutral">
                  {CATEGORY_LABELS[item.category ?? "other"] ?? "Other"}
                </StatusBadge>
              </div>
              <p className="mt-2 font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                From {actorName(item.author_id)} · {formatRelativeTime(item.created_at)}
              </p>
              <div className="mt-3 border-t border-border/60 pt-3">
                <TrustActActions interactionId={item.id} />
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {references.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-bold tracking-tight">References received</h2>
          {references.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Users className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    Reference from {actorName(item.author_id)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {RELATIONSHIP_LABELS[item.relationship] ?? "Other"}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(item.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {notifications.length > 0 ? (
        <section className="space-y-3">
          <h2 className="px-1 font-display text-lg font-bold tracking-tight">Updates</h2>
          {notifications.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(item.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
