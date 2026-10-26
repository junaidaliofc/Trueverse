"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  Code2,
  GraduationCap,
  Rocket,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/components/motion/primitives";

const categories = [
  {
    title: "Build something",
    description:
      "Start a product, app, or venture with someone whose skills fill a gap in yours.",
    icon: Blocks
  },
  {
    title: "Learn something",
    description:
      "Practice a skill alongside people who share that goal or can help you move through it.",
    icon: GraduationCap
  },
  {
    title: "Find collaborators",
    description:
      "Look for people who want to work on a defined goal, rather than a general social feed.",
    icon: Users
  }
] as const;

const steps = [
  {
    number: "01",
    title: "Share your goal.",
    description:
      "Describe what you want to accomplish, the skills you can offer, and the help you need."
  },
  {
    number: "02",
    title: "Discover compatible people.",
    description:
      "Review people whose goals and skills complement yours. A recommendation explains the overlap. It does not guarantee a fit."
  },
  {
    number: "03",
    title: "Connect and make progress together.",
    description:
      "A connection happens only when both people agree, then you take a concrete first step together."
  }
] as const;

const audiences = [
  {
    title: "Startup founders",
    description: "People starting a business who want a collaborator for a defined launch.",
    icon: Rocket
  },
  {
    title: "Developers and creators",
    description: "People building an application, product, or creative work that needs another skill.",
    icon: Code2
  },
  {
    title: "People learning new skills",
    description: "People who want practice or guidance tied to one learning goal.",
    icon: GraduationCap
  },
  {
    title: "Side-project builders",
    description: "People shipping something alongside other commitments, with a clear ask.",
    icon: Blocks
  }
] as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ddd6fe] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b18]";

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div id="top" className="relative min-h-dvh scroll-smooth bg-[#070b18] text-[#f7f8fc] motion-reduce:scroll-auto">
      <a
        href="#content"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[#161226] ${focusRing}`}
      >
        Skip to content
      </a>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 45% at 50% -10%, rgba(124,92,255,0.38), transparent 58%), radial-gradient(ellipse 42% 32% at 100% 18%, rgba(76,29,149,0.28), transparent 60%), radial-gradient(ellipse 36% 28% at 0% 72%, rgba(67,56,202,0.16), transparent 62%)"
        }}
      />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b18]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3 sm:h-16 sm:flex-nowrap sm:px-6">
          <Link
            href="/#top"
            className={`flex min-h-11 items-center gap-2 rounded-xl pr-2 font-display text-sm font-bold tracking-[0.22em] ${focusRing}`}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#6d4dff] text-base font-bold tracking-normal text-white">
              T
            </span>
            TRUEVERSE
          </Link>

          <nav
            aria-label="Primary"
            className="order-3 flex w-full items-center gap-1 sm:order-none sm:ml-6 sm:w-auto"
          >
            <Link
              href="/#how-it-works"
              className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#d7dced] hover:bg-white/5 hover:text-white ${focusRing}`}
            >
              How It Works
            </Link>
            <Link
              href="/#explore"
              className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-[#d7dced] hover:bg-white/5 hover:text-white ${focusRing}`}
            >
              Explore
            </Link>
          </nav>

          <Button
            asChild
            size="sm"
            className={`ml-auto min-h-11 bg-[#6d4dff] px-4 text-white hover:bg-[#7d62ff] focus-visible:border-[#ddd6fe] focus-visible:ring-[#ddd6fe]/80 ${focusRing}`}
          >
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <div id="content" className="relative">
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24">
          <motion.div
            className="max-w-3xl"
            initial={false}
            animate={reduceMotion ? undefined : "show"}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold tracking-[0.28em] text-[#c4b5fd]"
            >
              TRUEVERSE
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.6rem,8vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white"
            >
              What do you want to accomplish next?
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#d5dbeb] sm:text-xl"
            >
              Find people who share your ambition, complement your skills, and help turn your goals into reality.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-base text-[#c4b5fd] sm:text-lg">
              Your next chapter starts with the right people.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Button
                asChild
                size="lg"
                className={`min-h-12 w-full bg-[#6d4dff] text-white hover:bg-[#7d62ff] focus-visible:border-[#ddd6fe] focus-visible:ring-[#ddd6fe]/80 sm:w-auto sm:min-w-48 ${focusRing}`}
              >
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <section id="explore" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Explore a goal
            </h2>
            <p className="mt-3 text-base leading-7 text-[#c9d0e3]">
              Trueverse is for a specific next step: something to build, something to learn, or someone to work with.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <article
                  key={category.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_-36px_rgba(109,77,255,0.9)]"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#6d4dff]/20 text-[#ddd6fe] ring-1 ring-[#c4b5fd]/30">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#c9d0e3]">{category.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-base leading-7 text-[#c9d0e3]">
              Three steps, from a goal you can name to a connection both people choose.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="rounded-3xl border border-white/10 bg-[#10162a]/80 p-6"
              >
                <p className="font-mono text-sm font-medium tracking-[0.18em] text-[#c4b5fd]">
                  Step {step.number}
                </p>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#c9d0e3]">{step.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Who Trueverse is for
            </h2>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {audiences.map((audience) => {
              const Icon = audience.icon;
              return (
                <li
                  key={audience.title}
                  className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-[#ddd6fe] ring-1 ring-white/10">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{audience.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#c9d0e3]">{audience.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-24">
          <div className="overflow-hidden rounded-[2rem] border border-[#c4b5fd]/25 bg-[linear-gradient(160deg,rgba(109,77,255,0.28),rgba(16,22,42,0.2)_42%,rgba(7,11,24,0.1))] px-6 py-12 sm:px-12 sm:py-16">
            <h2 className="max-w-3xl text-balance font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Great things start with the right connection.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#d5dbeb]">
              Create an account when you are ready to describe what you want to accomplish next.
            </p>
            <Button
              asChild
              size="lg"
              className={`mt-8 min-h-12 w-full bg-white text-[#1a1333] hover:bg-[#f3f0ff] focus-visible:border-white focus-visible:ring-white sm:w-auto sm:min-w-48 ${focusRing}`}
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-[#aeb6cc]">
            Get Started opens account signup. Discovering people and sending connections are not available from this page yet.
          </p>
        </section>
      </div>
    </div>
  );
}
