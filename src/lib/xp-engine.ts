/**
 * Trueverse XP Engine
 * -------------------
 * Completely independent from trust.
 * XP never increases trust_index / trust_level.
 * Unlocks: levels, badges, themes, profile decorations, animations.
 */

export const XP_LEVEL_THRESHOLDS = [0, 100, 300, 700, 1200, 2000, 3200, 5000, 7500, 10000] as const;

export type XpRewardReason =
  | "complete_profile"
  | "daily_login"
  | "complete_mission"
  | "receive_appreciation"
  | "help_someone"
  | "volunteer"
  | "verify_identity"
  | "weekly_streak";

export const XP_REWARDS: Record<XpRewardReason, { amount: number; label: string }> = {
  complete_profile: { amount: 50, label: "Complete profile" },
  daily_login: { amount: 10, label: "Daily login" },
  complete_mission: { amount: 40, label: "Complete mission" },
  receive_appreciation: { amount: 25, label: "Receive appreciation" },
  help_someone: { amount: 60, label: "Help someone" },
  volunteer: { amount: 80, label: "Volunteer" },
  verify_identity: { amount: 100, label: "Verify identity" },
  weekly_streak: { amount: 75, label: "Weekly streak" }
};

export type UnlockKind = "level" | "badge" | "theme" | "decoration" | "animation";

export type XpUnlock = {
  id: string;
  kind: UnlockKind;
  title: string;
  description: string;
  requiredLevel: number;
  requiredXp?: number;
  unlocked: boolean;
};

export function xpToLevel(totalXp: number) {
  let level = 1;
  for (let i = 1; i < XP_LEVEL_THRESHOLDS.length; i += 1) {
    if (totalXp >= XP_LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentFloor = XP_LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextFloor =
    XP_LEVEL_THRESHOLDS[level] ?? currentFloor + Math.max(1000, Math.round(currentFloor * 0.35));
  const xpIntoLevel = totalXp - currentFloor;
  const xpForLevel = nextFloor - currentFloor || 1;
  const progress = Math.min(1, xpIntoLevel / xpForLevel);
  const xpToNext = Math.max(0, nextFloor - totalXp);

  return {
    level,
    currentFloor,
    nextFloor,
    progress,
    totalXp,
    xpIntoLevel,
    xpForLevel,
    xpToNext
  };
}

/** Pure function: award XP. Never mutates trust. */
export function awardXp(currentTotal: number, reason: XpRewardReason) {
  const reward = XP_REWARDS[reason];
  const before = xpToLevel(currentTotal);
  const afterTotal = currentTotal + reward.amount;
  const after = xpToLevel(afterTotal);

  return {
    reason,
    amount: reward.amount,
    label: reward.label,
    totalBefore: currentTotal,
    totalAfter: afterTotal,
    leveledUp: after.level > before.level,
    levelBefore: before.level,
    levelAfter: after.level
  };
}

export function getUnlocksForProgress(totalXp: number, catalog: XpUnlock[]): {
  unlocked: XpUnlock[];
  next: XpUnlock | null;
  upcomingBadge: XpUnlock | null;
} {
  const { level } = xpToLevel(totalXp);
  const withState = catalog.map((item) => ({
    ...item,
    unlocked: item.unlocked || level >= item.requiredLevel || totalXp >= (item.requiredXp ?? Infinity)
  }));
  const unlocked = withState.filter((item) => item.unlocked);
  const locked = withState
    .filter((item) => !item.unlocked)
    .sort((a, b) => a.requiredLevel - b.requiredLevel || (a.requiredXp ?? 0) - (b.requiredXp ?? 0));
  const next = locked[0] ?? null;
  const upcomingBadge = locked.find((item) => item.kind === "badge") ?? next;

  return { unlocked, next, upcomingBadge };
}

export type StreakState = {
  daily: number;
  weekly: number;
  monthly: number;
  lastActiveDate: string;
};

export function describeStreak(streak: StreakState) {
  return {
    dailyLabel: `${streak.daily}-day streak`,
    weeklyLabel: `${streak.weekly}-week streak`,
    monthlyLabel: `${streak.monthly}-month streak`,
    isOnFire: streak.daily >= 7
  };
}
