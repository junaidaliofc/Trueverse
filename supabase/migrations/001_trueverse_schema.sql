create extension if not exists pgcrypto;

create type public.user_role as enum ('member', 'admin');
create type public.interaction_status as enum ('pending', 'accepted', 'rejected');
create type public.report_status as enum ('pending', 'approved', 'rejected', 'disputed');
create type public.dispute_status as enum ('open', 'resolved', 'rejected');
create type public.trust_event_reason as enum ('positive_interaction', 'negative_report', 'admin_adjustment');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  photo_url text,
  bio text not null default '',
  trust_score integer not null default 50 check (trust_score between 0 and 1000),
  streak integer not null default 0 check (streak >= 0),
  trueverse_id text not null unique default ('tv_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  role public.user_role not null default 'member',
  last_positive_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trust_score_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  score_after integer not null,
  reason public.trust_event_reason not null,
  source_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.positive_interactions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  status public.interaction_status not null default 'pending',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint positive_interactions_no_self_review check (author_id <> recipient_id)
);

create table public.negative_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  evidence_url text not null,
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint negative_reports_no_self_report check (reporter_id <> reported_user_id)
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.negative_reports(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status public.dispute_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  location text,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index profiles_trueverse_id_idx on public.profiles(trueverse_id);
create index positive_interactions_recipient_status_idx on public.positive_interactions(recipient_id, status);
create index negative_reports_status_idx on public.negative_reports(status, created_at desc);
create index help_requests_created_at_idx on public.help_requests(created_at desc);
create index community_responses_request_id_idx on public.community_responses(request_id, created_at);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger positive_interactions_touch_updated_at
before update on public.positive_interactions
for each row execute function public.touch_updated_at();

create trigger negative_reports_touch_updated_at
before update on public.negative_reports
for each row execute function public.touch_updated_at();

create trigger help_requests_touch_updated_at
before update on public.help_requests
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, photo_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create or replace function public.apply_trust_delta(
  target_profile_id uuid,
  score_delta integer,
  event_reason public.trust_event_reason,
  event_source_id uuid,
  actor_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_score integer;
begin
  update public.profiles
  set trust_score = greatest(0, least(1000, trust_score + score_delta)),
      streak = case
        when score_delta > 0 then streak + 1
        when score_delta < 0 then 0
        else streak
      end,
      last_positive_at = case
        when score_delta > 0 then now()
        else last_positive_at
      end
  where id = target_profile_id
  returning trust_score into next_score;

  if next_score is null then
    raise exception 'profile_not_found';
  end if;

  insert into public.trust_score_events (
    profile_id,
    delta,
    score_after,
    reason,
    source_id,
    created_by
  )
  values (
    target_profile_id,
    score_delta,
    next_score,
    event_reason,
    event_source_id,
    actor_id
  );

  return next_score;
end;
$$;

create or replace function public.accept_positive_interaction(interaction_id uuid, accepting_user_id uuid)
returns public.positive_interactions
language plpgsql
security definer
set search_path = public
as $$
declare
  interaction public.positive_interactions;
begin
  update public.positive_interactions
  set status = 'accepted',
      accepted_at = now()
  where id = interaction_id
    and recipient_id = accepting_user_id
    and status = 'pending'
  returning * into interaction;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

  perform public.apply_trust_delta(
    interaction.author_id,
    3,
    'positive_interaction',
    interaction.id,
    accepting_user_id
  );

  return interaction;
end;
$$;

create or replace function public.review_negative_report(
  report_id uuid,
  admin_user_id uuid,
  next_status public.report_status,
  notes text default null
)
returns public.negative_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  report public.negative_reports;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  if next_status not in ('approved', 'rejected', 'disputed') then
    raise exception 'invalid_report_status';
  end if;

  update public.negative_reports
  set status = next_status,
      reviewed_by = admin_user_id,
      admin_notes = notes,
      reviewed_at = now()
  where id = report_id
    and status in ('pending', 'disputed')
  returning * into report;

  if report.id is null then
    raise exception 'report_not_found_or_already_reviewed';
  end if;

  if next_status = 'approved' then
    perform public.apply_trust_delta(
      report.reported_user_id,
      -5,
      'negative_report',
      report.id,
      admin_user_id
    );
  end if;

  return report;
end;
$$;

alter table public.profiles enable row level security;
alter table public.trust_score_events enable row level security;
alter table public.positive_interactions enable row level security;
alter table public.negative_reports enable row level security;
alter table public.disputes enable row level security;
alter table public.help_requests enable row level security;
alter table public.community_responses enable row level security;

create policy "profiles are public"
on public.profiles for select
using (true);

create policy "users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "trust events visible to owner and admins"
on public.trust_score_events for select
using (auth.uid() = profile_id or public.is_admin(auth.uid()));

create policy "users can create positive interactions"
on public.positive_interactions for insert
with check (auth.uid() = author_id);

create policy "positive interactions visible to participants and admins"
on public.positive_interactions for select
using (
  auth.uid() in (author_id, recipient_id)
  or public.is_admin(auth.uid())
);

create policy "recipients can reject pending positive interactions"
on public.positive_interactions for update
using (auth.uid() = recipient_id and status = 'pending')
with check (auth.uid() = recipient_id);

create policy "users can create negative reports"
on public.negative_reports for insert
with check (auth.uid() = reporter_id and evidence_url <> '');

create policy "negative reports visible to involved users and admins"
on public.negative_reports for select
using (
  auth.uid() in (reporter_id, reported_user_id)
  or public.is_admin(auth.uid())
);

create policy "admins can update reports"
on public.negative_reports for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "involved users can create disputes"
on public.disputes for insert
with check (auth.uid() = opened_by);

create policy "disputes visible to involved users and admins"
on public.disputes for select
using (
  auth.uid() = opened_by
  or public.is_admin(auth.uid())
);

create policy "public help requests are readable"
on public.help_requests for select
using (true);

create policy "authenticated users can create help requests"
on public.help_requests for insert
with check (auth.uid() = author_id);

create policy "authors can update help requests"
on public.help_requests for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "community responses are readable"
on public.community_responses for select
using (true);

create policy "authenticated users can respond"
on public.community_responses for insert
with check (auth.uid() = author_id);
