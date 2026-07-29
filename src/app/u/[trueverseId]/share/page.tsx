import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser, profiles } from "@/lib/dummy-data";
import { PRODUCT_DISCLAIMER, scoreToTrustLevel, TRUST_LEVEL_META } from "@/lib/design";
import { PageHeader } from "@/components/ui/section";
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle
} from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";

export default async function ShareProfilePage({
  params
}: {
  params: Promise<{ trueverseId: string }>;
}) {
  const { trueverseId } = await params;
  const profile = profiles.find((item) => item.trueverse_id === trueverseId) ?? currentUser;
  if (!profile || profile.trueverse_id !== trueverseId) {
    if (!profiles.some((item) => item.trueverse_id === trueverseId)) notFound();
  }

  const member = profiles.find((item) => item.trueverse_id === trueverseId);
  if (!member) notFound();

  const level = scoreToTrustLevel(member.trust_score);
  const shareUrl = `https://trueverse.app/u/${member.trueverse_id}`;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <PageHeader
        eyebrow="Share"
        title="Shareable reputation card"
        description="Portable trust signals for dating apps, marketplaces, campuses, and communities."
      />

      <Surface elevated className="overflow-hidden p-0">
        <div className="bg-accent px-6 py-8 text-accent-foreground">
          <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-80">Trueverse</p>
          <h2 className="mt-3 font-display text-3xl font-bold">{member.full_name}</h2>
          <p className="mt-1 font-mono text-sm opacity-80">{member.trueverse_id}</p>
          <div className="mt-5">
            <TrustLevelBadge level={level} className="bg-white/15 text-white ring-white/20" />
          </div>
          <p className="mt-3 text-sm opacity-90">{TRUST_LEVEL_META[level].label} trust level</p>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 py-8">
          <div
            className="flex size-44 items-center justify-center rounded-[1.5rem] bg-[repeating-linear-gradient(45deg,#0f766e_0_2px,transparent_2px_8px),repeating-linear-gradient(-45deg,#0f766e_0_2px,transparent_2px_8px)] bg-muted p-4"
            aria-label="QR code placeholder"
          >
            <div className="flex size-full items-center justify-center rounded-xl bg-surface-elevated text-center">
              <div>
                <p className="font-display text-lg font-bold text-foreground">QR</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{member.trueverse_id}</p>
              </div>
            </div>
          </div>
          <p className="break-all text-center font-mono text-xs text-muted-foreground">{shareUrl}</p>
          <div className="flex w-full flex-wrap gap-3">
            <Button className="flex-1">Copy link</Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/u/${member.trueverse_id}`}>Open profile</Link>
            </Button>
          </div>
        </div>
      </Surface>

      <Surface>
        <SurfaceHeader>
          <SurfaceTitle>Privacy respected</SurfaceTitle>
          <SurfaceDescription>{PRODUCT_DISCLAIMER}</SurfaceDescription>
        </SurfaceHeader>
      </Surface>
    </div>
  );
}
