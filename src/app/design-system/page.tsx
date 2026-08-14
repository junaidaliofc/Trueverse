"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Surface, SurfaceDescription, SurfaceHeader, SurfaceTitle } from "@/components/ui/surface";
import { UserAvatar } from "@/components/ui/user-avatar";
import { LabeledProgress } from "@/components/ui/progress-field";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { XPProgress, StreakPill } from "@/components/xp/xp-progress";
import { currentUserReputation, userXp } from "@/lib/dummy-data";
import { TRUST_LEVELS, TRUST_LEVEL_META } from "@/lib/design";
import { CommunityFeedPreviewSamples } from "@/components/community/feed-preview-samples";

/**
 * Phase 0 living style guide.
 * Product screens should compose these primitives — never invent one-off styles.
 */
export default function DesignSystemPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl space-y-12 py-8 sm:py-12">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Phase 0</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Design system</h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">
          shadcn/ui primitives, Trueverse tokens, and product components. Mobile-first. Dark mode.
          Built for a consumer trust product — not an admin console.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">
              Back to landing
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Open app shell</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/design-system/sprint4">Passport 2.0</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/design-system/sprint5">Community interactions</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/design-system/sprint6">Messages</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/design-system/sprint7">Search &amp; notifications</Link>
          </Button>
        </div>
      </motion.header>

      <section className="space-y-4">
        <SectionTitle title="Typography" />
        <Surface>
          <p className="font-display text-4xl font-bold tracking-tight">Outfit display</p>
          <p className="mt-3 text-lg text-muted-foreground">
            Plus Jakarta Sans for body copy, captions, and dense UI.
          </p>
          <p className="mt-3 font-mono text-sm text-muted-foreground">tv_ariamorgan · mono IDs</p>
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Buttons" />
        <Surface className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="lg">Large</Button>
          <Button size="sm">Small</Button>
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Badges & status" />
        <Surface className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <StatusBadge tone="brand">Brand</StatusBadge>
          <StatusBadge tone="success">Success</StatusBadge>
          <StatusBadge tone="xp">XP</StatusBadge>
          <StatusBadge tone="warning">Warning</StatusBadge>
          <StatusBadge tone="danger">Danger</StatusBadge>
          {TRUST_LEVELS.map((level) => (
            <TrustLevelBadge key={level} level={level} />
          ))}
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Form controls" />
        <Surface className="space-y-4">
          <div>
            <Label htmlFor="ds-name">Display name</Label>
            <Input id="ds-name" placeholder="Aria Morgan" className="mt-1.5 h-11 rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="ds-bio">Bio</Label>
            <Textarea id="ds-bio" placeholder="Tell your community…" className="mt-1.5 rounded-2xl" />
          </div>
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Surfaces & progress" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Surface>
            <SurfaceHeader>
              <SurfaceTitle>Glass surface</SurfaceTitle>
              <SurfaceDescription>Default consumer card</SurfaceDescription>
            </SurfaceHeader>
            <LabeledProgress value={72} label="Profile completion" />
          </Surface>
          <Surface elevated>
            <SurfaceHeader>
              <SurfaceTitle>Elevated</SurfaceTitle>
              <SurfaceDescription>Emphasis without dashboard chrome</SurfaceDescription>
            </SurfaceHeader>
            <LabeledProgress value={60} label="Weekly XP" indicatorClassName="bg-xp" />
          </Surface>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Avatars & tabs" />
        <Surface className="space-y-5">
          <div className="flex items-center gap-3">
            <UserAvatar name="Aria Morgan" size="sm" />
            <UserAvatar name="Aria Morgan" size="md" />
            <UserAvatar name="Aria Morgan" size="lg" />
            <StreakPill streak={14} />
          </div>
          <Separator />
          <Tabs defaultValue="trust">
            <TabsList className="w-full">
              <TabsTrigger value="trust" className="flex-1">
                Trust
              </TabsTrigger>
              <TabsTrigger value="xp" className="flex-1">
                XP
              </TabsTrigger>
            </TabsList>
            <TabsContent value="trust" className="mt-4 text-sm text-muted-foreground">
              Trust is earned from verified real-world signals. Never from XP or daily login.
            </TabsContent>
            <TabsContent value="xp" className="mt-4 text-sm text-muted-foreground">
              XP unlocks cosmetics, badges, themes, and achievements only.
            </TabsContent>
          </Tabs>
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Product — Trust & XP" />
        <div className="space-y-4">
          <TrustReputationCard
            stats={{
              trustIndex: currentUserReputation.trustIndex,
              identityVerified: true,
              trustActs: 127,
              appreciations: 98,
              communityRank: "Top 8%"
            }}
          />
          <ReputationDnaCard dna={currentUserReputation.dna} />
          <Surface>
            <XPProgress totalXp={userXp.total_xp} />
          </Surface>
        </div>
        <Surface>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Trust level ranges
          </p>
          <ul className="mt-4 space-y-2">
            {TRUST_LEVELS.map((level) => (
              <li
                key={level}
                className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2.5"
              >
                <span className="font-semibold">{TRUST_LEVEL_META[level].label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {TRUST_LEVEL_META[level].min}–{TRUST_LEVEL_META[level].max}
                </span>
              </li>
            ))}
          </ul>
        </Surface>
      </section>

      <section className="space-y-4">
        <SectionTitle title="Skeleton" />
        <Surface className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full rounded-3xl" />
        </Surface>
      </section>

      <section className="space-y-4" id="community-kit">
        <SectionTitle title="Community feed kit" />
        <p className="text-sm text-muted-foreground">
          Design kit only — authenticated Community uses live Supabase data, never these samples.
        </p>
        <CommunityFeedPreviewSamples />
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>;
}
