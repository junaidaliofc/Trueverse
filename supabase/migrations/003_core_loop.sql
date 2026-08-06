-- Phase 2: Core loop tables — missions, activity timeline, streaks, achievements
-- XP remains isolated from trust. award_xp() from 002 must never touch trust columns.

create type public.mission_cadence as enum ('daily', 'weekly');
create type public.timeline_event_type as enum (
  'help',
  'appreciation',
  'badge',
  'streak',
  'identity',
  'mission',
  'xp'
);

create table if not exists public.mission_templates (
  id text primary key,
  title text not null,
  description text not null,
  cadence public.mission_cadence not null,
  xp_reward integer not null check (xp_reward > 0),
  target integer not null default 1 check (target > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_missions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  template_id text not null references public.mission_templates(id),
  mission_date date not null default (timezone('utc', now()))::date,
  progress integer not null default 0 check (progress >= 0),
  target integer not null default 1 check (target > 0),
  completed_at timestamptz,
  xp_awarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique (profile_id, template_id, mission_date)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type public.timeline_event_type not null,
  title text not null check (char_length(title) between 2 and 160),
  body text not null check (char_length(body) between 2 and 500),
  metadata jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  daily_streak integer not null default 0 check (daily_streak >= 0),
  weekly_streak integer not null default 0 check (weekly_streak >= 0),
  monthly_streak integer not null default 0 check (monthly_streak >= 0),
  last_active_date date,
  updated_at timestamptz not null default now()
);

create index if not exists user_missions_profile_date_idx
  on public.user_missions(profile_id, mission_date desc);
create index if not exists activity_events_profile_created_idx
  on public.activity_events(profile_id, created_at desc);
create index if not exists activity_events_public_created_idx
  on public.activity_events(created_at desc)
  where is_public = true;

alter table public.mission_templates enable row level security;
alter table public.user_missions enable row level security;
alter table public.activity_events enable row level security;
alter table public.user_streaks enable row level security;

create policy mission_templates_public_read on public.mission_templates
  for select using (is_active = true);

create policy user_missions_owner_read on public.user_missions
  for select using (auth.uid() = profile_id or public.is_admin());

create policy activity_events_read on public.activity_events
  for select using (
    is_public = true
    or auth.uid() = profile_id
    or public.is_admin()
  );

create policy user_streaks_owner_read on public.user_streaks
  for select using (auth.uid() = profile_id or public.is_admin());

-- Seed default daily mission templates (3-slot habit loop)
insert into public.mission_templates (id, title, description, cadence, xp_reward, target)
values
  ('daily_appreciate', 'Appreciate someone', 'Send an appreciation on a community activity.', 'daily', 25, 1),
  ('daily_help', 'Help one person', 'Finish one Trust Act or offer verified help.', 'daily', 40, 1),
  ('daily_photo', 'Upload profile photo', 'Add a clear photo so people recognize you.', 'daily', 30, 1),
  ('weekly_verify_email', 'Verify email', 'Confirm your email to secure your account.', 'weekly', 40, 1),
  ('weekly_trust_act', 'Finish one Trust Act', 'Complete a verified interaction this week.', 'weekly', 60, 1),
  ('weekly_volunteer', 'Volunteer once', 'Log a verified volunteer action.', 'weekly', 80, 1)
on conflict (id) do nothing;
