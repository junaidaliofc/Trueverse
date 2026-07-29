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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";

export default function DashboardPage() {
  const firstName = currentUser.full_name.split(" ")[0] ?? "there";
  const todayMissions = missions.filter((mission) => mission.cadence === "daily");
  const recentBadges = badges.filter((badge) => badge.earned).slice(0, 3);
  const unread = notifications.filter((item) => !item.read).length;
  const weeklyProgress = Math.round((userXp.weekly_xp / userXp.weekly_goal) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Home</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Your trust signals, missions, and community — designed for clarity, not a control panel.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <TrustLevelBadge level={scoreToTrustLevel(currentUserReputation.trustIndex)} />
            <StreakPill streak={userXp.daily_streak} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/interactions/create">
            <Button>Log interaction</Button>
          </Link>
          <Link href="/missions">
            <Button variant="outline">Today&apos;s missions</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <TrustReputationCard
          stats={{
            trustIndex: currentUserReputation.trustIndex,
            identityVerified: currentUserReputation.identityVerified,
            trustActs: currentUserReputation.trustActs,
            appreciations: currentUserReputation.appreciations,
            communityRank: currentUserReputation.communityRank
          }}
          className="animate-fade-up stagger-1"
        />
        <Card className="animate-fade-up stagger-2">
          <XPProgress totalXp={userXp.total_xp} />
          <div className="mt-6">
            <Progress
              value={weeklyProgress}
              barClassName="bg-xp"
              label={`Weekly goal · ${userXp.weekly_xp} / ${userXp.weekly_goal} XP`}
            />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              XP unlocks cosmetics, badges, themes, and achievements. XP never increases trust.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="animate-fade-up stagger-2">
          <CardHeader>
            <div>
              <CardTitle>Today&apos;s missions</CardTitle>
              <CardDescription>Earn XP through participation — not trust.</CardDescription>
            </div>
            <Link href="/missions" className="text-sm font-semibold text-brand">
              View all
            </Link>
          </CardHeader>
          <ul className="space-y-3">
            {todayMissions.map((mission) => (
              <li
                key={mission.id}
                className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{mission.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{mission.description}</p>
                  </div>
                  <Badge tone={mission.completed ? "success" : "xp"}>+{mission.xp_reward} XP</Badge>
                </div>
                <div className="mt-3">
                  <Progress value={(mission.progress / mission.target) * 100} barClassName="bg-xp" />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <ReputationDnaCard
          dna={currentUserReputation.dna}
          className="animate-fade-up stagger-3"
          dimensions={["helping", "reliability", "communication", "leadership"]}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent achievements</CardTitle>
          </CardHeader>
          <ul className="space-y-3">
            {recentBadges.map((badge) => (
              <li key={badge.id} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
                <p className="font-semibold text-foreground">{badge.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Community activity</CardTitle>
              <CardDescription>Latest verified moments</CardDescription>
            </div>
            <Link href="/activity" className="text-sm font-semibold text-brand">
              Feed
            </Link>
          </CardHeader>
          <ul className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <li key={activity.id} className="rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50">
                <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.appreciations} appreciations · {activity.comments} comments
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Appreciate someone</CardTitle>
              <CardDescription>Suggested people</CardDescription>
            </div>
          </CardHeader>
          <ul className="space-y-3">
            {suggestedPeople.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/u/${person.trueverse_id}`}
                  className="flex items-center gap-3 rounded-2xl bg-muted/50 px-3 py-2.5 ring-1 ring-border/50 transition hover:bg-muted"
                >
                  <Avatar name={person.full_name} src={person.photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{person.full_name}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {person.trueverse_id}
                    </p>
                  </div>
                  <TrustLevelBadge level={scoreToTrustLevel(person.trust_score)} showLabel={false} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent trust events</CardTitle>
            <CardDescription>Server-side trust ledger signals</CardDescription>
          </CardHeader>
          <ul className="space-y-3">
            {trustTimeline.map((event) => (
              <li
                key={`${event.title}-${event.date}`}
                className="flex items-center gap-4 rounded-2xl bg-muted/50 px-4 py-3 ring-1 ring-border/50"
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
                  <p className="font-semibold text-foreground">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                {unread > 0 ? `${unread} unread notifications` : "You're caught up"}
              </CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["/activity", "Activity feed"],
              ["/notifications", "Notifications"],
              ["/badges", "Badges"],
              ["/insights", "Weekly insights"],
              ["/profile", "Edit profile"],
              ["/u/" + currentUser.trueverse_id, "Public preview"]
            ].map(([href, label]) => (
              <Link key={href} href={href}>
                <Button variant="secondary" className="w-full justify-start">
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
