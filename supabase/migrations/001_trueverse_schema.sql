-- Trueverse complete Supabase schema
-- Applies to a fresh Supabase project and uses Supabase Auth users as identity.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.user_role as enum ('member', 'admin');
create type public.interaction_status as enum ('pending', 'accepted', 'rejected', 'expired');
create type public.report_status as enum ('pending', 'under_review', 'approved', 'rejected', 'disputed');
create type public.dispute_status as enum ('open', 'under_review', 'resolved', 'rejected');
create type public.trust_event_reason as enum (
  'positive_interaction',
  'negative_report',
  'dispute_resolution',
  'admin_adjustment'
);
create type public.admin_action_type as enum (
  'report_reviewed',
  'dispute_reviewed',
  'user_role_changed',
  'trust_adjusted',
  'user_disabled',
  'user_enabled'
);
create type public.notification_type as enum (
  'positive_interaction_received',
  'positive_interaction_accepted',
  'negative_report_created',
  'negative_report_reviewed',
  'dispute_updated',
  'feed_response_received'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext,
  full_name text not null default '' check (char_length(full_name) <= 80),
  photo_url text,
  bio text not null default '' check (char_length(bio) <= 280),
  trust_score integer not null default 50 check (trust_score between 0 and 1000),
  streak integer not null default 0 check (streak >= 0),
  trueverse_id text not null unique default ('tv_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  role public.user_role not null default 'member',
  is_disabled boolean not null default false,
  last_positive_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_trueverse_id_format check (trueverse_id ~ '^tv_[a-z0-9]{8,24}$')
);

create table public.trust_score_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null check (delta between -100 and 100),
  score_before integer not null check (score_before between 0 and 1000),
  score_after integer not null check (score_after between 0 and 1000),
  reason public.trust_event_reason not null,
  source_table text,
  source_id uuid,
  notes text check (notes is null or char_length(notes) <= 1000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.positive_interactions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 12 and 1000),
  status public.interaction_status not null default 'pending',
  accepted_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint positive_interactions_no_self_review check (author_id <> recipient_id),
  constraint positive_interactions_terminal_timestamps check (
    (status = 'accepted' and accepted_at is not null and rejected_at is null)
    or (status = 'rejected' and rejected_at is not null and accepted_at is null)
    or (status in ('pending', 'expired') and accepted_at is null and rejected_at is null)
  )
);

create table public.negative_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 20 and 1600),
  evidence_url text not null,
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 1000),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint negative_reports_no_self_report check (reporter_id <> reported_user_id),
  constraint negative_reports_evidence_required check (char_length(trim(evidence_url)) > 0)
);

create table public.report_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.negative_reports(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  storage_path text,
  content_type text,
  description text check (description is null or char_length(description) <= 500),
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.negative_reports(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(reason) between 20 and 1600),
  status public.dispute_status not null default 'open',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolution_notes text check (resolution_notes is null or char_length(resolution_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint disputes_resolution_required check (
    (status in ('resolved', 'rejected') and resolved_at is not null and resolved_by is not null)
    or (status in ('open', 'under_review') and resolved_at is null)
  )
);

create table public.help_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  description text not null check (char_length(description) between 12 and 1000),
  location text check (location is null or char_length(location) <= 120),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.community_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.help_requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 4 and 800),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action_type public.admin_action_type not null,
  target_profile_id uuid references public.profiles(id) on delete set null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(title) <= 120),
  body text not null check (char_length(body) <= 500),
  source_table text,
  source_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);
create index profiles_trueverse_id_idx on public.profiles(trueverse_id);
create index profiles_role_idx on public.profiles(role);
create index trust_score_events_profile_created_idx on public.trust_score_events(profile_id, created_at desc);
create index positive_interactions_author_status_idx on public.positive_interactions(author_id, status, created_at desc);
create index positive_interactions_recipient_status_idx on public.positive_interactions(recipient_id, status, created_at desc);
create index negative_reports_reporter_idx on public.negative_reports(reporter_id, created_at desc);
create index negative_reports_reported_user_idx on public.negative_reports(reported_user_id, created_at desc);
create index negative_reports_status_idx on public.negative_reports(status, created_at asc);
create index report_evidence_report_id_idx on public.report_evidence(report_id, created_at);
create index disputes_report_id_idx on public.disputes(report_id);
create index disputes_status_idx on public.disputes(status, created_at asc);
create index help_requests_created_at_idx on public.help_requests(created_at desc);
create index community_responses_request_id_idx on public.community_responses(request_id, created_at);
create index admin_actions_actor_created_idx on public.admin_actions(actor_id, created_at desc);
create index notifications_recipient_unread_idx on public.notifications(recipient_id, created_at desc)
where read_at is null;

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

create or replace function public.protect_profile_system_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin(auth.uid()) then
    if new.email is distinct from old.email
      or new.trueverse_id is distinct from old.trueverse_id
      or new.trust_score is distinct from old.trust_score
      or new.streak is distinct from old.streak
      or new.role is distinct from old.role
      or new.is_disabled is distinct from old.is_disabled
      or new.last_positive_at is distinct from old.last_positive_at then
      raise exception 'profile_system_fields_are_read_only';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_system_fields
before update on public.profiles
for each row execute function public.protect_profile_system_fields();

create trigger positive_interactions_touch_updated_at
before update on public.positive_interactions
for each row execute function public.touch_updated_at();

create trigger negative_reports_touch_updated_at
before update on public.negative_reports
for each row execute function public.touch_updated_at();

create trigger disputes_touch_updated_at
before update on public.disputes
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
  insert into public.profiles (id, email, full_name, photo_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case
        when public.profiles.full_name = '' then excluded.full_name
        else public.profiles.full_name
      end,
      photo_url = coalesce(public.profiles.photo_url, excluded.photo_url);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_profile_email();

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
      and is_disabled = false
  );
$$;

create or replace function public.ensure_active_user(user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = user_id
      and is_disabled = false
  ) then
    raise exception 'active_user_required';
  end if;
end;
$$;

create or replace function public.apply_trust_delta(
  target_profile_id uuid,
  score_delta integer,
  event_reason public.trust_event_reason,
  event_source_table text default null,
  event_source_id uuid default null,
  actor_id uuid default null,
  event_notes text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_score integer;
  next_score integer;
begin
  select trust_score
  into previous_score
  from public.profiles
  where id = target_profile_id
  for update;

  if previous_score is null then
    raise exception 'profile_not_found';
  end if;

  next_score := greatest(0, least(1000, previous_score + score_delta));

  update public.profiles
  set trust_score = next_score,
      streak = case
        when score_delta > 0 then streak + 1
        when score_delta < 0 then 0
        else streak
      end,
      last_positive_at = case
        when score_delta > 0 then now()
        else last_positive_at
      end
  where id = target_profile_id;

  insert into public.trust_score_events (
    profile_id,
    delta,
    score_before,
    score_after,
    reason,
    source_table,
    source_id,
    notes,
    created_by
  )
  values (
    target_profile_id,
    score_delta,
    previous_score,
    next_score,
    event_reason,
    event_source_table,
    event_source_id,
    event_notes,
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
  perform public.ensure_active_user(accepting_user_id);

  update public.positive_interactions
  set status = 'accepted',
      accepted_at = now()
  where id = interaction_id
    and recipient_id = accepting_user_id
    and status = 'pending'
    and expires_at > now()
  returning * into interaction;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

  perform public.apply_trust_delta(
    interaction.author_id,
    3,
    'positive_interaction',
    'positive_interactions',
    interaction.id,
    accepting_user_id,
    'Recipient accepted positive interaction'
  );

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    source_table,
    source_id
  )
  values (
    interaction.author_id,
    'positive_interaction_accepted',
    'Positive interaction accepted',
    'Your positive interaction was accepted and your trust score increased by 3.',
    'positive_interactions',
    interaction.id
  );

  return interaction;
end;
$$;

create or replace function public.reject_positive_interaction(interaction_id uuid, rejecting_user_id uuid)
returns public.positive_interactions
language plpgsql
security definer
set search_path = public
as $$
declare
  interaction public.positive_interactions;
begin
  perform public.ensure_active_user(rejecting_user_id);

  update public.positive_interactions
  set status = 'rejected',
      rejected_at = now()
  where id = interaction_id
    and recipient_id = rejecting_user_id
    and status = 'pending'
  returning * into interaction;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

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
    and status in ('pending', 'under_review', 'disputed')
  returning * into report;

  if report.id is null then
    raise exception 'report_not_found_or_already_reviewed';
  end if;

  if next_status = 'approved' then
    perform public.apply_trust_delta(
      report.reported_user_id,
      -5,
      'negative_report',
      'negative_reports',
      report.id,
      admin_user_id,
      notes
    );
  end if;

  insert into public.admin_actions (
    actor_id,
    action_type,
    target_profile_id,
    target_table,
    target_id,
    metadata
  )
  values (
    admin_user_id,
    'report_reviewed',
    report.reported_user_id,
    'negative_reports',
    report.id,
    jsonb_build_object('status', next_status, 'notes', notes)
  );

  insert into public.notifications (
    recipient_id,
    type,
    title,
    body,
    source_table,
    source_id
  )
  values
    (
      report.reporter_id,
      'negative_report_reviewed',
      'Your report was reviewed',
      'An admin reviewed your negative interaction report.',
      'negative_reports',
      report.id
    ),
    (
      report.reported_user_id,
      'negative_report_reviewed',
      'A report involving you was reviewed',
      'An admin reviewed a negative interaction report involving your profile.',
      'negative_reports',
      report.id
    );

  return report;
end;
$$;

create or replace function public.resolve_dispute(
  dispute_id uuid,
  admin_user_id uuid,
  next_status public.dispute_status,
  notes text default null,
  restore_trust_delta integer default 0
)
returns public.disputes
language plpgsql
security definer
set search_path = public
as $$
declare
  dispute public.disputes;
  related_report public.negative_reports;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  if next_status not in ('resolved', 'rejected') then
    raise exception 'invalid_dispute_status';
  end if;

  update public.disputes
  set status = next_status,
      resolved_by = admin_user_id,
      resolution_notes = notes,
      resolved_at = now()
  where id = dispute_id
    and status in ('open', 'under_review')
  returning * into dispute;

  if dispute.id is null then
    raise exception 'dispute_not_found_or_already_resolved';
  end if;

  select *
  into related_report
  from public.negative_reports
  where id = dispute.report_id;

  if next_status = 'resolved' and restore_trust_delta <> 0 then
    perform public.apply_trust_delta(
      related_report.reported_user_id,
      restore_trust_delta,
      'dispute_resolution',
      'disputes',
      dispute.id,
      admin_user_id,
      notes
    );
  end if;

  insert into public.admin_actions (
    actor_id,
    action_type,
    target_profile_id,
    target_table,
    target_id,
    metadata
  )
  values (
    admin_user_id,
    'dispute_reviewed',
    related_report.reported_user_id,
    'disputes',
    dispute.id,
    jsonb_build_object('status', next_status, 'notes', notes, 'restore_trust_delta', restore_trust_delta)
  );

  return dispute;
end;
$$;

create or replace function public.admin_adjust_trust(
  target_profile_id uuid,
  admin_user_id uuid,
  score_delta integer,
  notes text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_score integer;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  if notes is null or char_length(trim(notes)) < 8 then
    raise exception 'notes_required';
  end if;

  next_score := public.apply_trust_delta(
    target_profile_id,
    score_delta,
    'admin_adjustment',
    'profiles',
    target_profile_id,
    admin_user_id,
    notes
  );

  insert into public.admin_actions (
    actor_id,
    action_type,
    target_profile_id,
    target_table,
    target_id,
    metadata
  )
  values (
    admin_user_id,
    'trust_adjusted',
    target_profile_id,
    'profiles',
    target_profile_id,
    jsonb_build_object('delta', score_delta, 'notes', notes, 'score_after', next_score)
  );

  return next_score;
end;
$$;

create or replace function public.set_user_role(
  target_profile_id uuid,
  admin_user_id uuid,
  next_role public.user_role
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  update public.profiles
  set role = next_role
  where id = target_profile_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'profile_not_found';
  end if;

  insert into public.admin_actions (
    actor_id,
    action_type,
    target_profile_id,
    target_table,
    target_id,
    metadata
  )
  values (
    admin_user_id,
    'user_role_changed',
    target_profile_id,
    'profiles',
    target_profile_id,
    jsonb_build_object('role', next_role)
  );

  return updated_profile;
end;
$$;

create or replace function public.set_user_disabled(
  target_profile_id uuid,
  admin_user_id uuid,
  disabled boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  if target_profile_id = admin_user_id and disabled then
    raise exception 'admins_cannot_disable_themselves';
  end if;

  update public.profiles
  set is_disabled = disabled
  where id = target_profile_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'profile_not_found';
  end if;

  insert into public.admin_actions (
    actor_id,
    action_type,
    target_profile_id,
    target_table,
    target_id,
    metadata
  )
  values (
    admin_user_id,
    case when disabled then 'user_disabled' else 'user_enabled' end,
    target_profile_id,
    'profiles',
    target_profile_id,
    jsonb_build_object('is_disabled', disabled)
  );

  return updated_profile;
end;
$$;

alter table public.profiles enable row level security;
alter table public.trust_score_events enable row level security;
alter table public.positive_interactions enable row level security;
alter table public.negative_reports enable row level security;
alter table public.report_evidence enable row level security;
alter table public.disputes enable row level security;
alter table public.help_requests enable row level security;
alter table public.community_responses enable row level security;
alter table public.admin_actions enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are public"
on public.profiles for select
using (is_disabled = false or auth.uid() = id or public.is_admin(auth.uid()));

create policy "users can update their own profile"
on public.profiles for update
using (auth.uid() = id and is_disabled = false)
with check (auth.uid() = id and is_disabled = false);

create policy "trust events visible to owner and admins"
on public.trust_score_events for select
using (auth.uid() = profile_id or public.is_admin(auth.uid()));

create policy "users can create positive interactions"
on public.positive_interactions for insert
with check (
  auth.uid() = author_id
  and author_id <> recipient_id
  and exists (
    select 1 from public.profiles
    where id = author_id
      and is_disabled = false
  )
  and exists (
    select 1 from public.profiles
    where id = recipient_id
      and is_disabled = false
  )
);

create policy "positive interactions visible to participants and admins"
on public.positive_interactions for select
using (
  auth.uid() in (author_id, recipient_id)
  or public.is_admin(auth.uid())
);

create policy "recipients can update pending positive interactions"
on public.positive_interactions for update
using (auth.uid() = recipient_id and status = 'pending')
with check (auth.uid() = recipient_id);

create policy "users can create negative reports"
on public.negative_reports for insert
with check (
  auth.uid() = reporter_id
  and reporter_id <> reported_user_id
  and char_length(trim(evidence_url)) > 0
);

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

create policy "report evidence visible to involved users and admins"
on public.report_evidence for select
using (
  public.is_admin(auth.uid())
  or exists (
    select 1
    from public.negative_reports reports
    where reports.id = report_id
      and auth.uid() in (reports.reporter_id, reports.reported_user_id)
  )
);

create policy "reporters can add report evidence"
on public.report_evidence for insert
with check (
  auth.uid() = uploaded_by
  and exists (
    select 1
    from public.negative_reports reports
    where reports.id = report_id
      and reports.reporter_id = auth.uid()
      and reports.status in ('pending', 'under_review', 'disputed')
  )
);

create policy "involved users can create disputes"
on public.disputes for insert
with check (
  auth.uid() = opened_by
  and exists (
    select 1
    from public.negative_reports reports
    where reports.id = report_id
      and auth.uid() in (reports.reporter_id, reports.reported_user_id)
  )
);

create policy "disputes visible to involved users and admins"
on public.disputes for select
using (
  auth.uid() = opened_by
  or public.is_admin(auth.uid())
  or exists (
    select 1
    from public.negative_reports reports
    where reports.id = report_id
      and auth.uid() in (reports.reporter_id, reports.reported_user_id)
  )
);

create policy "admins can update disputes"
on public.disputes for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

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
using (is_hidden = false or public.is_admin(auth.uid()) or auth.uid() = author_id);

create policy "authenticated users can respond"
on public.community_responses for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.help_requests
    where id = request_id
      and is_open = true
  )
);

create policy "admins can moderate responses"
on public.community_responses for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy "admin actions visible to admins"
on public.admin_actions for select
using (public.is_admin(auth.uid()));

create policy "notifications visible to recipient"
on public.notifications for select
using (auth.uid() = recipient_id or public.is_admin(auth.uid()));

create policy "recipients can mark notifications read"
on public.notifications for update
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('report-evidence', 'report-evidence', false, 20971520, array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'video/mp4'
  ])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars are public"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "report evidence visible to involved users and admins"
on storage.objects for select
using (
  bucket_id = 'report-evidence'
  and (
    public.is_admin(auth.uid())
    or exists (
      select 1
      from public.report_evidence evidence
      join public.negative_reports reports on reports.id = evidence.report_id
      where evidence.storage_path = storage.objects.name
        and auth.uid() in (reports.reporter_id, reports.reported_user_id)
    )
  )
);

create policy "reporters can upload report evidence"
on storage.objects for insert
with check (
  bucket_id = 'report-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);
