"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/components/motion/primitives";

const STEPS = [
  {
    icon: Users,
    title: "Check a person",
    body: "Search Trueverse by name or username to find someone's Passport."
  },
  {
    icon: ShieldCheck,
    title: "Review their Passport",
    body: "See verified identity signals and real interaction history — for context, not a verdict."
  },
  {
    icon: BadgeCheck,
    title: "Verify and build reputation",
    body: "Build your own Passport through verified, real-world interactions over time."
  }
] as const;

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative">
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-1 pb-16 pt-8 sm:min-h-[calc(100dvh-4rem)] sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(15,118,110,0.22), transparent 55%), radial-gradient(circle at 80% 70%, rgba(13,148,136,0.08), transparent 40%)"
          }}
        />

        <motion.div
          className="mx-auto w-full max-w-2xl text-center"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary"
          >
            Public beta
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-balance font-display text-[clamp(2.75rem,9vw,4.75rem)] font-bold leading-[0.98] tracking-[-0.035em] text-foreground"
          >
            Know who you&rsquo;re dealing with.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-5 max-w-md text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Trueverse gives people a shareable Passport built from verified identity and real
            interaction history.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="min-h-12 sm:min-w-48">
              <Link href="/check">
                Check Someone
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 sm:min-w-48">
              <Link href="/auth/signup">Create My Passport</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-4xl px-1 pb-20">
        <motion.div
          className="grid gap-4 sm:grid-cols-3"
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeUp}
                className="glass rounded-[1.5rem] p-6 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-lg font-bold tracking-tight">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mx-auto mt-10 max-w-xl text-center text-[11px] leading-5 text-muted-foreground/80">
          {PUBLIC_PROFILE_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
