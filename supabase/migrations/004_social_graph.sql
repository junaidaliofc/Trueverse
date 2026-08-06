-- Milestone 2 / Horizon B: Social reputation graph
-- Follows, appreciations, and comments support discovery & reciprocity.
-- These tables MUST NOT mutate trust_index / trust_level.

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

create table if not exists public.activity_appreciations (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activity_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (activity_id, profile_id)
);

create table if not exists public.activity_comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activity_events(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists follows_follower_idx on public.follows(follower_id, created_at desc);
create index if not exists follows_following_idx on public.follows(following_id, created_at desc);
create index if not exists activity_appreciations_activity_idx
  on public.activity_appreciations(activity_id, created_at desc);
create index if not exists activity_comments_activity_idx
  on public.activity_comments(activity_id, created_at asc);

alter table public.follows enable row level security;
alter table public.activity_appreciations enable row level security;
alter table public.activity_comments enable row level security;

create policy follows_read on public.follows
  for select using (true);

create policy follows_insert_own on public.follows
  for insert with check (auth.uid() = follower_id);

create policy follows_delete_own on public.follows
  for delete using (auth.uid() = follower_id);

create policy appreciations_read on public.activity_appreciations
  for select using (true);

create policy appreciations_insert_own on public.activity_appreciations
  for insert with check (auth.uid() = profile_id);

create policy appreciations_delete_own on public.activity_appreciations
  for delete using (auth.uid() = profile_id);

create policy comments_read on public.activity_comments
  for select using (is_hidden = false or auth.uid() = author_id or public.is_admin());

create policy comments_insert_own on public.activity_comments
  for insert with check (auth.uid() = author_id);

create policy comments_update_own on public.activity_comments
  for update using (auth.uid() = author_id or public.is_admin());

-- Optional XP leaderboard helper view (participation only — not trust)
create or replace view public.xp_leaderboard_weekly as
select
  p.id as profile_id,
  p.full_name,
  p.trueverse_id,
  p.photo_url,
  coalesce(x.weekly_xp, 0) as score,
  p.trust_level
from public.profiles p
left join public.user_xp x on x.profile_id = p.id
where p.is_disabled = false;
