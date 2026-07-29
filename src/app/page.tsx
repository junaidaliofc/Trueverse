"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Shield, Sparkles } from "lucide-react";
import {
  PRODUCT_DISCLAIMER,
  TRUST_DIMENSION_META,
  TRUST_DIMENSIONS,
  TRUST_SIGNAL_FACTORS
} from "@/lib/design";
import { currentUserReputation, profiles } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { scoreToTrustLevel } from "@/lib/design";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <section className="relative min-h-[min(92vh,56rem)] overflow-hidden pb-16 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% -20%, rgba(15,118,110,0.28), transparent 55%), radial-gradient(circle at 85% 30%, rgba(13,148,136,0.12), transparent 35%)"
          }}
        />

        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } }
          }}
        >
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand"
          >
            <Shield className="size-3.5" aria-hidden />
            Portable digital trust
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground text-balance sm:text-6xl lg:text-7xl"
          >
            Trueverse
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
          >
            The world&apos;s first portable reputation network — verified signals from real-world
            interactions, so people can make safer, more informed decisions.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button size="lg" className="min-w-40">
                Create your profile
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="min-w-40">
                Explore the app
              </Button>
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-xl text-xs leading-5 text-muted-foreground">
            {PRODUCT_DISCLAIMER}
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-2"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <TrustReputationCard
            stats={{
              trustIndex: currentUserReputation.trustIndex,
              identityVerified: currentUserReputation.identityVerified,
              trustActs: currentUserReputation.trustActs,
              appreciations: currentUserReputation.appreciations,
              communityRank: currentUserReputation.communityRank
            }}
          />
          <ReputationDnaCard dna={currentUserReputation.dna} title="Reputation DNA" />
        </motion.div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">How trust is earned</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Seven dimensions of verified reputation
          </h2>
          <p className="mt-4 text-muted-foreground">
            Trust comes from real-world behavior. XP is a separate progression system for cosmetics
            and achievements — it never increases trust.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TRUST_DIMENSIONS.map((key) => (
            <article key={key} className="glass rounded-3xl p-5 transition duration-300 hover:-translate-y-0.5">
              <h3 className="font-display text-lg font-bold text-foreground">
                {TRUST_DIMENSION_META[key].label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {TRUST_DIMENSION_META[key].description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="trust" className="scroll-mt-24 py-16 sm:py-20">
        <div className="glass mx-auto grid max-w-5xl gap-10 rounded-[2rem] p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand">
              <Sparkles className="size-3.5" aria-hidden />
              Trust engine
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Levels, not vanity scores
            </h2>
            <p className="mt-4 text-muted-foreground leading-7">
              Public profiles show a trust level computed server-side from verified signals. Users
              cannot edit trust. Daily login never increases trust.
            </p>
            <ul className="mt-6 space-y-3">
              {TRUST_SIGNAL_FACTORS.map((factor) => (
                <li key={factor} className="flex items-start gap-3 text-sm text-foreground">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            {[
              ["New", "0–20"],
              ["Developing", "21–40"],
              ["Established", "41–65"],
              ["Highly Established", "66–85"],
              ["Exceptional", "86–100"]
            ].map(([label, range]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/60"
              >
                <span className="font-semibold text-foreground">{label}</span>
                <span className="font-mono text-xs text-muted-foreground">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24 pt-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Members</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Reputation that travels with you
            </h2>
          </div>
          <Link href="/u/tv_sarahkim" className="text-sm font-semibold text-brand hover:underline">
            View public profile
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.slice(1, 4).map((profile) => (
            <Link
              key={profile.id}
              href={`/u/${profile.trueverse_id}`}
              className="glass rounded-3xl p-5 transition duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{profile.full_name}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{profile.trueverse_id}</p>
                </div>
                <TrustLevelBadge level={scoreToTrustLevel(profile.trust_score)} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{profile.bio}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
