import { TRUST_LEVEL_META, type TrustLevel, scoreToTrustLevel } from "@/lib/design";
import { Badge } from "@/components/ui/badge";
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
  const resolved = level ?? scoreToTrustLevel(score ?? 50);
  const meta = TRUST_LEVEL_META[resolved];

  return (
    <Badge tone={meta.tone as "neutral" | "brand" | "success" | "premium" | "info"} className={cn(className)}>
      {showLabel ? "Trust · " : null}
      {meta.label}
    </Badge>
  );
}
