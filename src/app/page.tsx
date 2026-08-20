"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PUBLIC_PROFILE_DISCLAIMER } from "@/lib/design";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/components/motion/primitives";

/**
 * Landing — brand-first beta entry.
 */
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

          <motion.p
            variants={fadeUp}
            className="mt-4 font-display text-[clamp(3.5rem,14vw,7.5rem)] font-bold leading-[0.92] tracking-[-0.05em] text-foreground"
          >
            Trueverse
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mx-auto mt-8 max-w-xl text-balance font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Portable trust for the real world
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Verified reputation signals from real interactions — so people can make safer, more
            informed decisions.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-10 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="min-h-12 sm:min-w-44">
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 sm:min-w-44">
              <Link href="/u/sarahkim">View Demo Profile</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold"
          >
            <Link href="/trust" className="text-primary hover:underline">
              Trust principles
            </Link>
            <Link href="/launch" className="text-primary hover:underline">
              Launch readiness
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-10 max-w-md text-[11px] leading-5 text-muted-foreground/80"
          >
            {PUBLIC_PROFILE_DISCLAIMER}
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}
