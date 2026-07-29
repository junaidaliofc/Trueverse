-- Trueverse trust levels, XP system, and Reputation DNA
-- Trust and XP are completely separate. XP never increases trust.

create type public.trust_level as enum (
  'new',
  'developing',
  'established',
  'highly_established',
  'exceptional'
);

create type public.trust_dimension as enum (
  'helping',
  'reliability',
  'communication',
  'professionalism',
  'safety',
  'community',
  'leadership'
);

-- Public trust index is 0–100. Internal ledger may still use deltas;
-- this column is the normalized public signal.
alter table public.profiles
  add column if not exists trust_index integer not null default 15
    check (trust_index between 0 and 100),
  add column if not exists trust_level public.trust_level not null default 'new',
  add column if not exists identity_verified boolean not null default false,
  add column if not exists cover_image_url text,
  add column if not exists username citext unique,
  add column if not exists profile_completion_pct integer not null default 0
    check (profile_completion_pct between 0 and 100),
  add column if not exists trust_acts integer not null default 0 check (trust_acts >= 0),
  add column if not exists appreciations_count integer not null default 0 check (appreciations_count >= 0);

create or replace function public.score_to_trust_level(score integer)
returns public.trust_level
language sql
immutable
as $$
  select case
    when score >= 86 then 'exceptional'::public.trust_level
    when score >= 66 then 'highly_established'::public.trust_level
    when score >= 41 then 'established'::public.trust_level
    when score >= 21 then 'developing'::public.trust_level
    else 'new'::public.trust_level
  end;
$$;

create or replace function public.refresh_profile_trust_level(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  idx integer;
begin
  select trust_index into idx from public.profiles where id = target_profile_id for update;
  if idx is null then
    return;
  end if;

  update public.profiles
  set
    trust_level = public.score_to_trust_level(idx),
    updated_at = now()
  where id = target_profile_id;
end;
$$;

-- Reputation DNA: per-dimension scores 0–100, independent from XP
create table if not exists public.reputation_dna (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  helping integer not null default 0 check (helping between 0 and 100),
  reliability integer not null default 0 check (reliability between 0 and 100),
  communication integer not null default 0 check (communication between 0 and 100),
  professionalism integer not null default 0 check (professionalism between 0 and 100),
  safety integer not null default 0 check (safety between 0 and 100),
  community integer not null default 0 check (community between 0 and 100),
  leadership integer not null default 0 check (leadership between 0 and 100),
  updated_at timestamptz not null default now()
);

-- XP system — cosmetics / badges / themes / achievements only
create table if not exists public.user_xp (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  total_xp integer not null default 0 check (total_xp >= 0),
  current_level integer not null default 1 check (current_level between 1 and 100),
  daily_streak integer not null default 0 check (daily_streak >= 0),
  last_login_date date,
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  week_start date,
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount between 1 and 5000),
  reason text not null check (char_length(reason) between 2 and 80),
  source_table text,
  source_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_profile_created_idx
  on public.xp_events(profile_id, created_at desc);

create or replace function public.xp_to_level(total integer)
returns integer
language sql
immutable
as $$
  select case
    when total >= 10000 then 10
    when total >= 7500 then 9
    when total >= 5000 then 8
    when total >= 3200 then 7
    when total >= 2000 then 6
    when total >= 1200 then 5
    when total >= 700 then 4
    when total >= 300 then 3
    when total >= 100 then 2
    else 1
  end;
$$;

-- Award XP without touching trust. Intentionally isolated from apply_trust_delta.
create or replace function public.award_xp(
  target_profile_id uuid,
  amount integer,
  reason text,
  source_table text default null,
  source_id uuid default null
)
returns public.user_xp
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.user_xp;
begin
  if amount <= 0 then
    raise exception 'XP amount must be positive';
  end if;

  insert into public.user_xp(profile_id, total_xp, current_level)
  values (target_profile_id, 0, 1)
  on conflict (profile_id) do nothing;

  update public.user_xp
  set
    total_xp = total_xp + amount,
    weekly_xp = weekly_xp + amount,
    current_level = public.xp_to_level(total_xp + amount),
    updated_at = now()
  where profile_id = target_profile_id
  returning * into row;

  insert into public.xp_events(profile_id, amount, reason, source_table, source_id)
  values (target_profile_id, amount, reason, source_table, source_id);

  return row;
end;
$$;

create table if not exists public.badges (
  id text primary key,
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  badge_id text not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);

create table if not exists public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

alter table public.reputation_dna enable row level security;
alter table public.user_xp enable row level security;
alter table public.xp_events enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy reputation_dna_public_read on public.reputation_dna
  for select using (true);

create policy user_xp_owner_read on public.user_xp
  for select using (auth.uid() = profile_id or public.is_admin());

create policy xp_events_owner_read on public.xp_events
  for select using (auth.uid() = profile_id or public.is_admin());

create policy badges_public_read on public.badges
  for select using (true);

create policy user_badges_public_read on public.user_badges
  for select using (true);

create policy achievements_public_read on public.achievements
  for select using (true);

create policy user_achievements_public_read on public.user_achievements
  for select using (true);

-- Prevent clients from writing trust fields / DNA / XP directly
create or replace function public.protect_extended_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is distinct from new.id and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  if not public.is_admin() then
    new.trust_index := old.trust_index;
    new.trust_level := old.trust_level;
    new.identity_verified := old.identity_verified;
    new.trust_acts := old.trust_acts;
    new.appreciations_count := old.appreciations_count;
    new.trust_score := old.trust_score;
    new.streak := old.streak;
    new.role := old.role;
    new.is_disabled := old.is_disabled;
    new.trueverse_id := old.trueverse_id;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_extended_profile_fields on public.profiles;
create trigger protect_extended_profile_fields
  before update on public.profiles
  for each row execute function public.protect_extended_profile_fields();
