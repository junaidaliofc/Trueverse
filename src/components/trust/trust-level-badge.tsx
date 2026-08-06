import { TRUST_LEVEL_META, type TrustLevel, scoreToTrustLevel } from "@/lib/design";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export function TrustLevelBadge({
  level,
  score,
  className,
  showLabel = true
}: {
  level?: TrustLevel;
  score?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const resolved = level ?? scoreToTrustLevel(score ?? 15);
  const meta = TRUST_LEVEL_META[resolved];

  return (
    <StatusBadge tone={meta.tone} className={cn(className)}>
      {showLabel ? "Trust · " : null}
      {meta.label}
    </StatusBadge>
  );
}
