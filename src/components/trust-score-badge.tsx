import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { scoreToTrustLevel } from "@/lib/design";

/** @deprecated Prefer TrustLevelBadge — kept for gradual migration */
export function TrustScoreBadge({ score }: { score: number }) {
  return <TrustLevelBadge level={scoreToTrustLevel(score)} />;
}
