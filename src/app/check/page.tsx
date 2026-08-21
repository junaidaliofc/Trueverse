import Link from "next/link";
import { Search, UserX } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deriveV1Reputation, passportUsername } from "@/lib/passport";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteButton } from "@/components/check/invite-button";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string;
  username: string | null;
  photo_url: string | null;
  trueverse_id: string;
  identity_verified: boolean | null;
  trust_acts: number | null;
};

export default async function CheckPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const searched = term.length >= 2;

  let results: ProfileRow[] = [];
  if (searched && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const safe = term.replace(/[%,()*\\]/g, " ").trim();
    if (safe) {
      try {
        const supabase = await createSupabaseServerClient();
        const { data } = await supabase
          .from("profiles")
          .select("id,full_name,username,photo_url,trueverse_id,identity_verified,trust_acts")
          .eq("is_disabled", false)
          .or(`username.ilike.%${safe}%,full_name.ilike.%${safe}%`)
          .limit(12)
          .returns<ProfileRow[]>();
        results = data ?? [];
      } catch {
        results = [];
      }
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Check</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Check Someone
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Search Trueverse by name or username to view a person&rsquo;s Passport.
        </p>
      </div>

      <form action="/check" method="get" className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            name="q"
            defaultValue={term}
            placeholder="Name or username"
            aria-label="Search Trueverse users"
            className="h-11 rounded-2xl pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {!searched ? (
        <div className="glass rounded-[1.75rem] px-6 py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Search className="size-5" aria-hidden />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Enter at least 2 characters to search.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass rounded-[1.75rem] px-6 py-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <UserX className="size-5" aria-hidden />
          </div>
          <p className="mt-4 font-display text-base font-bold">
            We couldn&rsquo;t find this person on Trueverse.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            They may not have a Passport yet. Invite them to create one.
          </p>
          <InviteButton className="mt-5" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {results.map((row) => {
            const username = passportUsername(row);
            const handle = row.username ? `@${row.username.replace(/^@/, "")}` : row.trueverse_id;
            const reputation = deriveV1Reputation({
              accountVerified: Boolean(row.identity_verified),
              verifiedInteractions: row.trust_acts ?? 0
            });
            return (
              <div key={row.id} className="glass flex items-center gap-3 rounded-2xl p-4">
                <UserAvatar name={row.full_name || "Trueverse Member"} src={row.photo_url} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {row.full_name || "Trueverse Member"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{handle}</p>
                  <div className="mt-1.5">
                    <StatusBadge tone={row.identity_verified ? "success" : "neutral"}>
                      {reputation.label}
                    </StatusBadge>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/u/${username}`}>View Passport</Link>
                </Button>
              </div>
            );
          })}

          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground">Not who you were looking for?</p>
            <InviteButton className="mt-3" />
          </div>
        </div>
      )}
    </div>
  );
}
