import { Flame } from "lucide-react";
import { xpToLevel } from "@/lib/design";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function XPProgress({
  totalXp,
  className,
  compact = false
}: {
  totalXp: number;
  className?: string;
  compact?: boolean;
}) {
  const { level, progress, nextFloor, totalXp: xp } = xpToLevel(totalXp);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Badge tone="xp">XP Lv {level}</Badge>
        <div className="min-w-24 flex-1">
          <Progress value={progress * 100} barClassName="bg-xp" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-xp">Experience</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">Level {level}</p>
        </div>
        <Badge tone="xp">{xp.toLocaleString()} XP</Badge>
      </div>
      <Progress value={progress * 100} barClassName="bg-xp" label={`Next level at ${nextFloor.toLocaleString()} XP`} />
    </div>
  );
}

export function StreakPill({ streak, className }: { streak: number; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl bg-xp-soft px-3 py-2 text-sm font-semibold text-xp ring-1 ring-xp/20",
        className
      )}
    >
      <Flame className="size-4 fill-current" aria-hidden />
      <span>{streak}-day streak</span>
    </div>
  );
}
