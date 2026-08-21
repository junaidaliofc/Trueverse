import Link from "next/link";
import { ArrowRight, BadgeCheck, Bell, Shield, ShieldCheck, UserRound, Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MotionCard, MotionItem, MotionPage } from "@/components/motion/primitives";

export const dynamic = "force-dynamic";

/**
 * V1 reputation vocabulary. Only the first three states are derivable from the
 * data we currently store. Established / Strong / Exceptional require a
 * reputation engine that does not exist yet, so they are never assigned here.
 */
const REPUTATION_TIERS = [
  "Unverified",
  "Verified",
  "Building",
  "Established",
  "Strong",
  "Exceptional"
] as const;

type ReputationTier = (typeof REPUTATION_TIERS)[number];

export default async function TrustCenterPage() {
  const { supabase, user, profile } = await requireProfile();

  const { data: incoming, error: incomingError } = await supabase
    .from("positive_interactions")
    .select("id,status")
    .eq("recipient_id", profile.id)
    .returns<{ id: string; status: string }[]>();

  const interactionsAvailable = !incomingError;
  const verifiedInteractions = incoming?.filter((row) => row.status === "accepted").length ?? 0;
  const pendingRequests = incoming?.filter((row) => row.status === "pending").length ?? 0;

  const { data: activityRows, error: activityError } = await supabase
    .from("notifications")
    .select("id,type,title,body,created_at")
    .eq("recipient_id", profile.id)
    .in("type", ["positive_interaction_received", "positive_interaction_accepted"])
    .order("created_at", { ascending: false })
    .limit(6)
    .returns<{ id: string; type: string; title: string; body: string; created_at: string }[]>();

  const activity = activityError ? [] : activityRows ?? [];

  const emailVerified = Boolean(user.email_confirmed_at);
  const identityVerified = Boolean(profile.identity_verified);
  const accountVerified = emailVerified || identityVerified;

  let reputationLabel: ReputationTier;
  let reputationNote: string;
  if (!accountVerified) {
    reputationLabel = "Unverified";
    reputationNote =
      "Verification incomplete — confirm your account details to start building trust.";
  } else if (verifiedInteractions === 0) {
    reputationLabel = "Verified";
    reputationNote =
      "Your account is verified. Build a real interaction history to grow your reputation.";
  } else {
    reputationLabel = "Building";
    reputationNote = "You're building a verified interaction history.";
  }
  const reputationIndex = REPUTATION_TIERS.indexOf(reputationLabel);

  const displayName = profile.full_name || "Trueverse Member";
  const handle = profile.username
    ? `@${profile.username.replace(/^@/, "")}`
    : profile.trueverse_id;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  const signals = [
    {
      key: "account",
      label: "Account verification",
      icon: Shield,
      value: emailVerified ? "Verified" : "Incomplete",
      tone: emailVerified ? ("success" as const) : ("warning" as const)
    },
    {
      key: "identity",
      label: "Identity verification",
      icon: BadgeCheck,
      value: identityVerified ? "Verified" : "Not yet",
      tone: identityVerified ? ("success" as const) : ("neutral" as const)
    },
    {
      key: "interactions",
      label: "Verified interactions",
      icon: Users,
      value: interactionsAvailable ? String(verifiedInteractions) : "Not available yet",
      tone: "neutral" as const
    },
    {
      key: "requests",
      label: "Pending requests",
      icon: Bell,
      value: interactionsAvailable ? String(pendingRequests) : "Not available yet",
      tone: interactionsAvailable && pendingRequests > 0 ? ("brand" as const) : ("neutral" as const)
    }
  ];

  const quickActions = [
    { label: "View My Passport", href: "/profile", icon: UserRound },
    { label: "Complete Profile", href: "/profile", icon: ShieldCheck },
    { label: "View Requests", href: "/notifications", icon: Bell }
  ];

  const steps = [
    { label: "Confirm your email address", done: emailVerified, href: null as string | null },
    { label: "Choose a unique username", done: Boolean(profile.username), href: "/profile" },
    { label: "Add a profile photo", done: Boolean(profile.photo_url), href: "/profile" },
    {
      label: "Write a short bio",
      done: Boolean(profile.bio && profile.bio.trim().length > 0),
      href: "/profile"
    }
  ];
  if (interactionsAvailable && pendingRequests > 0) {
    steps.push({
      label: `Review ${pendingRequests} pending request${pendingRequests > 1 ? "s" : ""}`,
      done: false,
      href: "/notifications"
    });
  }

  return (
    <MotionPage className="mx-auto max-w-lg space-y-5 sm:space-y-6">
      <MotionItem className="pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Trust Center
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Your Trust Center
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Verify what matters, build real interaction history, and strengthen your Trueverse
          Passport.
        </p>
      </MotionItem>

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <UserAvatar name={displayName} src={profile.photo_url} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-bold tracking-tight">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{handle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge tone="neutral">
                {profile.role === "admin" ? "Admin" : "Member"} · since {memberSince}
              </StatusBadge>
              {emailVerified ? (
                <StatusBadge tone="success">
                  <BadgeCheck className="mr-1 size-3.5" aria-hidden />
                  Email verified
                </StatusBadge>
              ) : (
                <StatusBadge tone="warning">Email unverified</StatusBadge>
              )}
              {identityVerified ? (
                <StatusBadge tone="success">
                  <BadgeCheck className="mr-1 size-3.5" aria-hidden />
                  Identity verified
                </StatusBadge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/60 bg-background/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Reputation
            </p>
            <StatusBadge tone="brand">
              <ShieldCheck className="mr-1 size-3.5" aria-hidden />
              {reputationLabel}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{reputationNote}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {REPUTATION_TIERS.map((tier, index) => (
              <span
                key={tier}
                className={
                  index === reputationIndex
                    ? "rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand/40"
                    : index < reputationIndex
                      ? "rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground"
                      : "rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground/60"
                }
              >
                {tier}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground/70">
            Higher tiers unlock as verified interaction history accrues.
          </p>
        </div>

        <Button asChild className="mt-5 w-full" size="lg">
          <Link href="/profile">
            View My Passport
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      </MotionCard>

      <MotionItem>
        <h2 className="mb-3 px-1 font-display text-lg font-bold tracking-tight">Passport signals</h2>
        <div className="grid grid-cols-2 gap-3">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.key} className="glass rounded-2xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                  <p className="text-xs font-semibold">{signal.label}</p>
                </div>
                <div className="mt-3">
                  <StatusBadge tone={signal.tone}>{signal.value}</StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </MotionItem>

      <MotionItem>
        <h2 className="mb-3 px-1 font-display text-lg font-bold tracking-tight">Quick actions</h2>
        <div className="grid gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="glass flex items-center gap-3 rounded-2xl p-4 transition-colors hover:bg-muted/40"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1 font-semibold">{action.label}</span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            );
          })}
        </div>
      </MotionItem>

      <MotionCard className="glass rounded-[1.75rem] p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight">Strengthen your Passport</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Truthful next steps based on your current account.
        </p>
        <ul className="mt-4 space-y-2.5">
          {steps.map((step) => {
            const row = (
              <div className="flex items-center gap-3">
                <span
                  className={
                    step.done
                      ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                      : "flex size-6 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
                  }
                >
                  {step.done ? <BadgeCheck className="size-3.5" aria-hidden /> : null}
                </span>
                <span
                  className={
                    step.done
                      ? "flex-1 text-sm text-muted-foreground line-through"
                      : "flex-1 text-sm font-medium text-foreground"
                  }
                >
                  {step.label}
                </span>
                {!step.done && step.href ? (
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                ) : null}
              </div>
            );
            return (
              <li key={step.label}>
                {!step.done && step.href ? (
                  <Link
                    href={step.href}
                    className="block rounded-xl p-1 transition-colors hover:bg-muted/40"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="p-1">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      </MotionCard>

      <MotionItem>
        <h2 className="mb-3 px-1 font-display text-lg font-bold tracking-tight">
          Recent trust activity
        </h2>
        {activity.length === 0 ? (
          <div className="glass rounded-[1.75rem] px-6 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Shield className="size-5" aria-hidden />
            </div>
            <p className="mt-4 font-display text-base font-bold">No trust activity yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Verified interactions and references will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activity.map((item) => (
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
          </div>
        )}
      </MotionItem>
    </MotionPage>
  );
}
