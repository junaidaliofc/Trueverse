import Link from "next/link";
import {
  activities,
  badges,
  currentUser,
  currentUserReputation,
  missions,
  notifications,
  suggestedPeople,
  trustTimeline,
  userXp
} from "@/lib/dummy-data";
import { getGreeting } from "@/lib/utils";
import { scoreToTrustLevel } from "@/lib/design";
import { TrustReputationCard } from "@/components/trust/trust-reputation-card";
import { ReputationDnaCard } from "@/components/trust/reputation-dna";
import { XPProgress, StreakPill } from "@/components/xp/xp-progress";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Surface, SurfaceDescription, SurfaceHeader, SurfaceTitle } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { LabeledProgress } from "@/components/ui/progress-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function DashboardPage() {
  const firstName = currentUser.full_name.split(" ")[0] ?? "there";
  const todayMissions = missions.filter((mission) => mission.cadence === "daily");
  const recentBadges = badges.filter((badge) => badge.earned).slice(0, 3);
  const unread = notifications.filter((item) => !item.read).length;
  const weeklyProgress = Math.round((userXp.weekly_xp / userXp.weekly_goal) * 100);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Home</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Trust signals and daily progress — calm, personal, never a control panel.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TrustLevelBadge level={scoreToTrustLevel(currentUserReputation.trustIndex)} />
            <StreakPill streak={userXp.daily_streak} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/interactions/create">Log interaction</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/missions">Missions</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <TrustReputationCard
          stats={{
            trustIndex: currentUserReputation.trustIndex,
            identityVerified: currentUserReputation.identityVerified,
            trustActs: currentUserReputation.trustActs,
            appreciations: currentUserReputation.appreciations,
            communityRank: currentUserReputation.communityRank
          }}
        />
        <Surface className="animate-fade-up stagger-1">
          <XPProgress totalXp={userXp.total_xp} />
          <div className="mt-5">
            <LabeledProgress
              value={weeklyProgress}
              indicatorClassName="bg-xp"
              label={`Weekly goal · ${userXp.weekly_xp} / ${userXp.weekly_goal} XP`}
            />
          </div>
        </Surface>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Surface>
          <SurfaceHeader>
            <div>
              <SurfaceTitle>Today&apos;s missions</SurfaceTitle>
              <SurfaceDescription>Earn XP through participation — not trust.</SurfaceDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/missions">View all</Link>
            </Button>
          </SurfaceHeader>
          <ul className="space-y-3">
            {todayMissions.map((mission) => (
              <li key={mission.id} className="rounded-2xl bg-muted/50 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{mission.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{mission.description}</p>
                  </div>
                  <StatusBadge tone={mission.completed ? "success" : "xp"}>
                    +{mission.xp_reward} XP
                  </StatusBadge>
                </div>
                <div className="mt-3">
                  <LabeledProgress
                    value={(mission.progress / mission.target) * 100}
                    indicatorClassName="bg-xp"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        <ReputationDnaCard
          dna={currentUserReputation.dna}
          dimensions={["helping", "reliability", "communication", "leadership"]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Surface>
          <SurfaceHeader>
            <SurfaceTitle>Recent achievements</SurfaceTitle>
          </SurfaceHeader>
          <ul className="space-y-3">
            {recentBadges.map((badge) => (
              <li key={badge.id} className="rounded-2xl bg-muted/50 px-4 py-3">
                <p className="font-semibold">{badge.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SurfaceHeader>
            <div>
              <SurfaceTitle>Community</SurfaceTitle>
              <SurfaceDescription>Latest verified moments</SurfaceDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/activity">Feed</Link>
            </Button>
          </SurfaceHeader>
          <ul className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <li key={activity.id} className="rounded-2xl bg-muted/50 px-4 py-3">
                <p className="text-sm font-semibold">{activity.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.appreciations} appreciations
                </p>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SurfaceHeader>
            <div>
              <SurfaceTitle>Appreciate</SurfaceTitle>
              <SurfaceDescription>Suggested people</SurfaceDescription>
            </div>
          </SurfaceHeader>
          <ul className="space-y-2">
            {suggestedPeople.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/u/${person.trueverse_id}`}
                  className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5 transition hover:bg-muted"
                >
                  <UserAvatar name={person.full_name} src={person.photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{person.full_name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {person.trueverse_id}
                    </p>
                  </div>
                  <TrustLevelBadge level={scoreToTrustLevel(person.trust_score)} showLabel={false} />
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface>
          <SurfaceHeader>
            <div>
              <SurfaceTitle>Trust events</SurfaceTitle>
              <SurfaceDescription>Server-side ledger signals</SurfaceDescription>
            </div>
          </SurfaceHeader>
          <ul className="space-y-3">
            {trustTimeline.map((event) => (
              <li
                key={`${event.title}-${event.date}`}
                className="flex items-center gap-4 rounded-2xl bg-muted/50 px-4 py-3"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-2xl text-sm font-bold ${
                    event.tone === "positive"
                      ? "bg-success-soft text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {event.delta}
                </span>
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface>
          <SurfaceHeader>
            <div>
              <SurfaceTitle>Quick actions</SurfaceTitle>
              <SurfaceDescription>
                {unread > 0 ? `${unread} unread notifications` : "You're caught up"}
              </SurfaceDescription>
            </div>
          </SurfaceHeader>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["/activity", "Activity"],
              ["/notifications", "Notifications"],
              ["/badges", "Badges"],
              ["/insights", "Insights"],
              ["/profile", "Profile"],
              [`/u/${currentUser.trueverse_id}`, "Public view"]
            ].map(([href, label]) => (
              <Button key={href} asChild variant="secondary" className="justify-start">
                <Link href={href}>{label}</Link>
              </Button>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}
