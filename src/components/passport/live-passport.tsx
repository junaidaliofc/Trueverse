import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessagesSquare,
  Share2,
  Shield,
  ShieldCheck,
  Users
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  PASSPORT_SIGNAL_DISCLAIMER,
  V1_REPUTATION_TIERS,
  type V1ReputationTier
} from "@/lib/passport";

type SignalTone = "success" | "warning" | "neutral" | "brand";

export type LivePassportProps = {
  mode: "owner" | "public";
  displayName: string;
  handle: string;
  photoUrl: string | null;
  bio?: string | null;
  memberSince: string;
  accountVerified: boolean;
  identityVerified: boolean;
  reputation: { label: V1ReputationTier; note: string; index: number };
  verifiedInteractions: number;
  references: number;
  publicPath: string;
  sharePath: string;
  startInteractionHref?: string | null;
  reportHref?: string | null;
};

function SignalTile({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  tone: SignalTone;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <div className="mt-3">
        <StatusBadge tone={tone}>{value}</StatusBadge>
      </div>
    </div>
  );
}

/** Trust-focused Passport built only from real profile data. No XP, no numeric score. */
export function LivePassport(props: LivePassportProps) {
  const isOwner = props.mode === "owner";

  return (
    <div className="mx-auto max-w-lg space-y-5 sm:max-w-2xl sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] text-accent-foreground">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(155deg,#0f3f3a_0%,#123f3a_50%,#0b2e2a_100%)]"
        />
        <div className="relative px-6 pb-7 pt-8 sm:px-8">
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.28em] text-teal-200/90">
            {isOwner ? "Your Trueverse Passport" : "Trueverse Passport"}
          </p>
          <div className="mt-5 flex items-center gap-4">
            <UserAvatar
              name={props.displayName}
              src={props.photoUrl}
              size="lg"
              className="!size-20 rounded-[1.35rem] ring-2 ring-white/15 after:rounded-[1.35rem]"
            />
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold tracking-tight text-white">
                {props.displayName}
              </h1>
              <p className="truncate font-mono text-sm text-teal-100/80">{props.handle}</p>
              <p className="mt-1 text-xs text-teal-100/70">Member since {props.memberSince}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge className="bg-white/12 text-white ring-1 ring-white/20">
              <ShieldCheck className="mr-1 size-3.5" aria-hidden />
              {props.reputation.label}
            </StatusBadge>
            <StatusBadge
              className={
                props.identityVerified
                  ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30"
                  : "bg-white/10 text-teal-100/80"
              }
            >
              {props.identityVerified ? (
                <>
                  <BadgeCheck className="mr-1 size-3.5" aria-hidden />
                  Identity verified
                </>
              ) : (
                "Identity unverified"
              )}
            </StatusBadge>
          </div>
        </div>
      </section>

      {props.bio ? (
        <p className="px-1 text-sm leading-6 text-muted-foreground">{props.bio}</p>
      ) : null}

      <section className="glass rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Reputation status
          </p>
          <StatusBadge tone="brand">{props.reputation.label}</StatusBadge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{props.reputation.note}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {V1_REPUTATION_TIERS.map((tier, index) => (
            <span
              key={tier}
              className={
                index === props.reputation.index
                  ? "rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand ring-1 ring-brand/40"
                  : index < props.reputation.index
                    ? "rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground"
                    : "rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground/60"
              }
            >
              {tier}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/70">
          Higher tiers unlock as verified interaction history accrues. No numeric score is used.
        </p>
      </section>

      <section>
        <h2 className="mb-3 px-1 font-display text-lg font-bold tracking-tight">Passport signals</h2>
        <div className="grid grid-cols-2 gap-3">
          <SignalTile
            icon={ShieldCheck}
            label="Account verification"
            value={props.accountVerified ? "Verified" : "Incomplete"}
            tone={props.accountVerified ? "success" : "warning"}
          />
          <SignalTile
            icon={BadgeCheck}
            label="Identity verification"
            value={props.identityVerified ? "Verified" : "Not yet"}
            tone={props.identityVerified ? "success" : "neutral"}
          />
          <SignalTile
            icon={Users}
            label="Verified interactions"
            value={String(props.verifiedInteractions)}
            tone="neutral"
          />
          <SignalTile
            icon={MessagesSquare}
            label="References"
            value={String(props.references)}
            tone="neutral"
          />
        </div>
      </section>

      <section className="grid gap-2.5">
        {isOwner ? (
          <>
            <Button asChild size="lg" className="w-full">
              <Link href={props.sharePath}>
                <Share2 className="size-4" aria-hidden />
                Share Passport
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href={props.publicPath}>
                View Public Passport
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg" className="w-full">
              <Link href={props.sharePath}>
                <Share2 className="size-4" aria-hidden />
                Share Passport
              </Link>
            </Button>
            {props.startInteractionHref ? (
              <Button asChild size="lg" variant="outline" className="w-full">
                <Link href={props.startInteractionHref}>Start Interaction</Link>
              </Button>
            ) : null}
            {props.reportHref ? (
              <Link
                href={props.reportHref}
                className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Shield className="size-4" aria-hidden />
                Report a concern
              </Link>
            ) : null}
          </>
        )}
      </section>

      {!isOwner ? (
        <p className="px-1 pb-4 text-center text-xs leading-5 text-muted-foreground">
          {PASSPORT_SIGNAL_DISCLAIMER}
        </p>
      ) : null}
    </div>
  );
}
