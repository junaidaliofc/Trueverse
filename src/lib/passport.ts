/**
 * Trueverse Passport — view models & helpers.
 * DNA / verifications / trust stats are server-authored; clients only display.
 */

import type { Profile } from "@/lib/types";
import {
  scoreToTrustLevel,
  toPassportDna,
  type PassportDna,
  type PassportPrivacy,
  type PassportStats,
  type ReputationDna,
  type TrustLevel,
  type VerificationItem
} from "@/lib/design";
import { xpToLevel } from "@/lib/xp-engine";
import type { BadgeDef, TimelineEvent } from "@/lib/dummy-data";

export type PassportMode = "owner" | "public";

export type PassportReputationEventKind =
  | "trust_act"
  | "achievement"
  | "verification"
  | "contribution"
  | "mission";

export type PassportReputationEvent = {
  id: string;
  kind: PassportReputationEventKind;
  title: string;
  body: string;
  created_at: string;
  actor_name?: string;
  meta?: string;
};

export type PassportViewModel = {
  profile: Profile;
  username: string;
  displayName: string;
  trueverseId: string;
  trustIndex: number;
  trustLevel: TrustLevel;
  identityVerified: boolean;
  xpLevel: number;
  totalXp: number;
  profileCompletion: number;
  dna: PassportDna;
  verifications: VerificationItem[];
  badges: BadgeDef[];
  timeline: PassportReputationEvent[];
  stats: PassportStats;
  privacy: PassportPrivacy;
  sharePath: string;
  bio?: string;
};

/** Public path segment — prefers username, falls back to Trueverse ID. */
export function passportUsername(profile: Pick<Profile, "trueverse_id"> & { username?: string | null }) {
  if (profile.username) return profile.username.replace(/^@/, "").toLowerCase();
  return profile.trueverse_id.replace(/^tv_/, "").toLowerCase();
}

export function passportSharePath(profile: Pick<Profile, "trueverse_id"> & { username?: string | null }) {
  return `/u/${passportUsername(profile)}`;
}

export function findProfileByPublicSlug(
  profiles: Profile[],
  slug: string
): Profile | undefined {
  const normalized = decodeURIComponent(slug).replace(/^@/, "").toLowerCase();
  return profiles.find((p) => {
    const uname = passportUsername(p);
    return (
      p.trueverse_id.toLowerCase() === normalized ||
      uname === normalized ||
      `tv_${uname}` === normalized
    );
  });
}

export function mapTimelineToPassport(
  events: TimelineEvent[]
): PassportReputationEvent[] {
  return events.map((event) => {
    let kind: PassportReputationEventKind = "contribution";
    if (event.type === "help") kind = "trust_act";
    else if (event.type === "badge" || event.type === "streak" || event.type === "xp")
      kind = "achievement";
    else if (event.type === "identity") kind = "verification";
    else if (event.type === "mission") kind = "mission";
    else if (event.type === "appreciation") kind = "contribution";

    return {
      id: event.id,
      kind,
      title: event.title,
      body: event.body,
      created_at: event.created_at,
      actor_name: event.actor_name,
      meta: event.meta
    };
  });
}

export function buildPassportDnaFromTrustIndex(trustIndex: number): PassportDna {
  const dna: ReputationDna = {
    helping: Math.min(100, trustIndex + 20),
    reliability: Math.min(100, trustIndex + 8),
    communication: Math.min(100, trustIndex + 12),
    professionalism: Math.max(0, Math.min(100, trustIndex - 5)),
    safety: Math.min(100, trustIndex + 5),
    community: Math.min(100, trustIndex + 10),
    leadership: Math.max(20, Math.min(100, trustIndex - 10))
  };
  return toPassportDna(dna);
}

export function yearsActiveFrom(createdAt: string, now = new Date()) {
  const start = new Date(createdAt).getTime();
  const years = (now.getTime() - start) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.round(years * 10) / 10);
}

export function filterPassportForPrivacy(
  passport: PassportViewModel,
  mode: PassportMode
): PassportViewModel {
  if (mode === "owner") return passport;
  const { privacy } = passport;
  return {
    ...passport,
    dna: privacy.showDna ? passport.dna : emptyDna(),
    verifications: privacy.showVerifications ? passport.verifications : [],
    badges: privacy.showBadges ? passport.badges : [],
    timeline: privacy.showTimeline ? passport.timeline : [],
    stats: privacy.showStatistics
      ? passport.stats
      : {
          trustActs: 0,
          uniqueContributors: 0,
          references: 0,
          yearsActive: passport.stats.yearsActive,
          appreciationsReceived: 0,
          missionsCompleted: 0
        },
    // Public never shows private contact details on verification rows
    bio: passport.bio
  };
}

function emptyDna(): PassportDna {
  return {
    helping: 0,
    reliability: 0,
    integrity: 0,
    community: 0,
    leadership: 0
  };
}

export type LiveTrustActRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  author_id: string;
  recipient_id: string;
  created_at: string;
  accepted_at?: string | null;
};

/**
 * Passport for an authenticated / live DB profile.
 * Never invents Aria demo DNA, badges, timeline, or verification.
 */
export function buildLivePassportViewModel(
  profile: Profile & {
    trust_index?: number | null;
    identity_verified?: boolean | null;
    trust_acts?: number | null;
    appreciations_count?: number | null;
    profile_completion_pct?: number | null;
    unique_contributors?: number | null;
    references_count?: number | null;
    missions_completed?: number | null;
  },
  options?: {
    emailVerified?: boolean;
    totalXp?: number;
    badges?: BadgeDef[];
    timeline?: PassportReputationEvent[];
    trustActs?: LiveTrustActRow[];
  }
): PassportViewModel {
  const trustIndex =
    typeof profile.trust_index === "number"
      ? Math.max(0, Math.min(100, profile.trust_index))
      : typeof profile.trust_score === "number" && profile.trust_score > 100
        ? Math.max(0, Math.min(100, Math.round(profile.trust_score / 10)))
        : Math.max(0, Math.min(100, profile.trust_score ?? 15));

  const username = passportUsername(profile);
  const totalXp = options?.totalXp ?? 0;
  const emailVerified = Boolean(options?.emailVerified);
  // Only show identity verified when a real DB flag exists — never invent it.
  const identityVerified = Boolean(profile.identity_verified);

  const completionChecks = [
    Boolean(profile.full_name),
    Boolean(profile.username),
    Boolean(profile.photo_url),
    Boolean(profile.bio),
    Boolean(profile.city),
    Boolean(profile.headline),
    Boolean((profile.interests ?? []).length)
  ];
  const profileCompletion =
    profile.profile_completion_pct ??
    Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100);

  const verifications: VerificationItem[] = [
    {
      kind: "email",
      label: "Email",
      status: emailVerified ? "verified" : "unverified",
      completed_at: emailVerified ? profile.created_at : null,
      detail: emailVerified ? "Verified" : undefined
    },
    {
      kind: "identity",
      label: "Identity",
      status: identityVerified ? "verified" : "unverified",
      completed_at: identityVerified ? profile.updated_at : null,
      detail: identityVerified ? "Identity verified" : undefined
    }
  ];

  const acceptedActs = (options?.trustActs ?? []).filter(
    (act) => act.status === "accepted"
  );
  const actTimeline: PassportReputationEvent[] = acceptedActs.slice(0, 12).map((act) => ({
    id: `act-${act.id}`,
    kind: "trust_act" as const,
    title: act.title || "Trust Act accepted",
    body: act.description || "A positive Trust Act was accepted.",
    created_at: act.accepted_at || act.created_at,
    meta: "Accepted"
  }));

  const baseTimeline: PassportReputationEvent[] = [
    {
      id: `created-${profile.id}`,
      kind: "verification",
      title: "Account created",
      body: "Joined Trueverse and started building portable reputation signals.",
      created_at: profile.created_at,
      meta: "Joined"
    },
    ...(emailVerified
      ? [
          {
            id: `email-${profile.id}`,
            kind: "verification" as const,
            title: "Email verified",
            body: "Email confirmation completed through Trueverse Auth.",
            created_at: profile.created_at,
            meta: "Verified"
          }
        ]
      : []),
    ...actTimeline
  ].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const timeline: PassportReputationEvent[] = options?.timeline ?? baseTimeline;

  return {
    profile,
    username,
    displayName: profile.full_name || "Trueverse Member",
    trueverseId: profile.trueverse_id,
    trustIndex,
    trustLevel: scoreToTrustLevel(trustIndex),
    identityVerified,
    xpLevel: xpToLevel(totalXp).level,
    totalXp,
    profileCompletion,
    dna: emptyDna(),
    verifications,
    badges: options?.badges ?? [],
    timeline,
    stats: {
      trustActs: profile.trust_acts ?? acceptedActs.length,
      uniqueContributors: profile.unique_contributors ?? 0,
      references: profile.references_count ?? 0,
      yearsActive: yearsActiveFrom(profile.created_at),
      appreciationsReceived: profile.appreciations_count ?? 0,
      missionsCompleted: profile.missions_completed ?? 0
    },
    privacy: {
      showDna: false,
      showVerifications: true,
      showBadges: true,
      showTimeline: true,
      showStatistics: true
    },
    sharePath: passportSharePath(profile),
    bio: profile.bio
  };
}

export function redactVerificationDetails(
  items: VerificationItem[],
  mode: PassportMode
): VerificationItem[] {
  if (mode === "owner") return items;
  return items.map((item) => ({
    ...item,
    detail:
      item.status === "verified"
        ? item.kind === "email" || item.kind === "phone"
          ? "Verified"
          : item.detail?.includes("@") || item.detail?.match(/\d{3}/)
            ? "Verified"
            : item.detail
        : item.status === "pending"
          ? "In progress"
          : undefined
  }));
}
