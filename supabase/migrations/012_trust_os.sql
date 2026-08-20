-- Sprint 8: Trust OS — moderation, appeals, reporter accuracy, identity architecture.
-- Trust is earned. Badges, feedback, and identity fields never manufacture trust.

-- ---------------------------------------------------------------------------
-- Identity architecture (prepared only — not required for beta)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists skills text[] not null default '{}',
  add column if not exists reports_filed integer not null default 0 check (reports_filed >= 0),
  add column if not exists reports_approved integer not null default 0 check (reports_approved >= 0),
  add column if not exists reports_rejected integer not null default 0 check (reports_rejected >= 0),
  add column if not exists reporter_accuracy numeric,
  add column if not exists reporting_cooldown_until timestamptz,
  add column if not exists reporting_suspended boolean not null default false,
  add column if not exists flagged_at timestamptz,
  add column if not exists flag_reason text,
  add column if not exists identity_verification_status text not null default 'not_started',
  add column if not exists phone_verified_at timestamptz,
  add column if not exists government_id_status text not null default 'not_requested',
  add column if not exists duplicate_risk_score integer not null default 0
    check (duplicate_risk_score between 0 and 100),
  add column if not exists device_signals jsonb not null default '{}'::jsonb,
  add column if not exists behavior_signals jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_identity_verification_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_identity_verification_status_check
      check (identity_verification_status in (
        'not_started', 'pending', 'verified', 'rejected', 'expired'
      ));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_government_id_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_government_id_status_check
      check (government_id_status in (
        'not_requested', 'pending', 'verified', 'rejected', 'expired'
      ));
  end if;
end $$;

comment on column public.profiles.identity_verification_status is
  'Prepared for future one-person-one-reputation. Not required today. Never auto-grants trust.';
comment on column public.profiles.phone_verified_at is
  'Prepared for future phone verification. Null until that program ships.';
comment on column public.profiles.government_id_status is
  'Prepared for optional government ID. Does not change Trust Score.';
comment on column public.profiles.duplicate_risk_score is
  'Prepared duplicate-account signal 0–100. Unused in beta scoring.';
comment on column public.profiles.device_signals is
  'Prepared device fingerprint envelope. Empty until enforcement ships.';
comment on column public.profiles.behavior_signals is
  'Prepared behavior signals. Empty until enforcement ships.';
comment on column public.profiles.skills is
  'Member-stated skills. Display only — never a trust input.';

-- Members may edit skills. Reporter stats, flags, and identity signals stay server-authored.
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
    new.reports_filed := old.reports_filed;
    new.reports_approved := old.reports_approved;
    new.reports_rejected := old.reports_rejected;
    new.reporter_accuracy := old.reporter_accuracy;
    new.reporting_cooldown_until := old.reporting_cooldown_until;
    new.reporting_suspended := old.reporting_suspended;
    new.flagged_at := old.flagged_at;
    new.flag_reason := old.flag_reason;
    new.identity_verification_status := old.identity_verification_status;
    new.phone_verified_at := old.phone_verified_at;
    new.government_id_status := old.government_id_status;
    new.duplicate_risk_score := old.duplicate_risk_score;
    new.device_signals := old.device_signals;
    new.behavior_signals := old.behavior_signals;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Positive Trust Acts: admin review after recipient accept
-- ---------------------------------------------------------------------------
alter table public.positive_interactions
  add column if not exists admin_status text,
  add column if not exists admin_reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists admin_reviewed_at timestamptz,
  add column if not exists admin_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'positive_interactions_admin_status_check'
  ) then
    alter table public.positive_interactions
      add constraint positive_interactions_admin_status_check
      check (admin_status is null or admin_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

update public.positive_interactions
set admin_status = 'approved'
where status = 'accepted' and admin_status is null;

create index if not exists positive_interactions_admin_status_idx
  on public.positive_interactions (admin_status, created_at desc)
  where admin_status = 'pending';

-- Recipient accept confirms the act. Trust updates only after admin approval.
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
      accepted_at = now(),
      admin_status = 'pending'
  where id = interaction_id
    and recipient_id = accepting_user_id
    and status = 'pending'
    and expires_at > now()
  returning * into interaction;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

  insert into public.notifications (
    recipient_id, type, title, body, source_table, source_id
  ) values (
    interaction.author_id,
    'positive_interaction_accepted',
    'Trust Act accepted — pending review',
    'The recipient confirmed this Trust Act. Trust Score updates only after moderation approval.',
    'positive_interactions',
    interaction.id
  );

  return interaction;
end;
$$;

create table if not exists public.moderation_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(action) between 2 and 80),
  reason text check (reason is null or char_length(reason) <= 1000),
  affected_user_id uuid references public.profiles(id) on delete set null,
  target_table text,
  target_id uuid,
  previous_status text,
  new_status text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_audit_log_created_idx
  on public.moderation_audit_log (created_at desc);

comment on table public.moderation_audit_log is
  'Immutable moderation ledger. Inserts only. Never mutates trust by itself.';

create or replace function public.write_moderation_audit(
  admin_id uuid,
  action_name text,
  reason_text text,
  affected_user uuid,
  target_table_name text,
  target_row uuid,
  prev_status text,
  next_status text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  log_id uuid;
begin
  insert into public.moderation_audit_log (
    admin_id, action, reason, affected_user_id, target_table, target_id, previous_status, new_status
  ) values (
    admin_id, action_name, reason_text, affected_user, target_table_name, target_row, prev_status, next_status
  ) returning id into log_id;
  return log_id;
end;
$$;

create or replace function public.review_positive_trust_act(
  act_id uuid,
  admin_user_id uuid,
  next_status text,
  notes text default null
)
returns public.positive_interactions
language plpgsql
security definer
set search_path = public
as $$
declare
  act public.positive_interactions;
  prev text;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;
  if next_status not in ('approved', 'rejected') then
    raise exception 'invalid_admin_status';
  end if;

  select * into act from public.positive_interactions where id = act_id for update;
  if act.id is null then
    raise exception 'act_not_found';
  end if;
  if act.status <> 'accepted' or coalesce(act.admin_status, 'pending') <> 'pending' then
    raise exception 'act_not_awaiting_review';
  end if;

  prev := coalesce(act.admin_status, 'pending');

  update public.positive_interactions
  set admin_status = next_status,
      admin_reviewed_by = admin_user_id,
      admin_reviewed_at = now(),
      admin_notes = notes
  where id = act_id
  returning * into act;

  if next_status = 'approved' then
    perform public.apply_trust_delta(
      act.author_id,
      3,
      'positive_interaction',
      'positive_interactions',
      act.id,
      admin_user_id,
      coalesce(notes, 'Admin approved Trust Act')
    );
  end if;

  insert into public.admin_actions (
    actor_id, action_type, target_profile_id, target_table, target_id, metadata
  ) values (
    admin_user_id,
    'trust_adjusted',
    act.author_id,
    'positive_interactions',
    act.id,
    jsonb_build_object('admin_status', next_status, 'notes', notes, 'trust_changed', next_status = 'approved')
  );

  perform public.write_moderation_audit(
    admin_user_id,
    case when next_status = 'approved' then 'approve_trust_act' else 'reject_trust_act' end,
    notes,
    act.author_id,
    'positive_interactions',
    act.id,
    prev,
    next_status
  );

  return act;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reporter accuracy + cooldown after rejected reports
-- ---------------------------------------------------------------------------
create or replace function public.refresh_reporter_accuracy(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  approved integer;
  rejected integer;
  accuracy numeric;
begin
  select reports_approved, reports_rejected
  into approved, rejected
  from public.profiles
  where id = target_profile_id
  for update;

  if approved is null then
    return;
  end if;

  if approved + rejected = 0 then
    accuracy := null;
  else
    accuracy := round((approved::numeric / (approved + rejected)) * 100, 1);
  end if;

  update public.profiles
  set
    reporter_accuracy = accuracy,
    reporting_cooldown_until = case
      when rejected >= 5 and coalesce(accuracy, 100) < 40 then now() + interval '7 days'
      else reporting_cooldown_until
    end,
    reporting_suspended = case
      when rejected >= 10 and coalesce(accuracy, 100) < 25 then true
      else reporting_suspended
    end
  where id = target_profile_id;
end;
$$;

create or replace function public.note_report_filed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set reports_filed = reports_filed + 1
  where id = new.reporter_id;
  return new;
end;
$$;

drop trigger if exists negative_reports_note_filed on public.negative_reports;
create trigger negative_reports_note_filed
after insert on public.negative_reports
for each row execute function public.note_report_filed();

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
  prev text;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  if next_status not in ('approved', 'rejected', 'disputed') then
    raise exception 'invalid_report_status';
  end if;

  select * into report from public.negative_reports where id = report_id for update;
  if report.id is null then
    raise exception 'report_not_found_or_already_reviewed';
  end if;
  if report.status not in ('pending', 'under_review', 'disputed') then
    raise exception 'report_not_found_or_already_reviewed';
  end if;

  prev := report.status;

  update public.negative_reports
  set status = next_status,
      reviewed_by = admin_user_id,
      admin_notes = notes,
      reviewed_at = now()
  where id = report_id
  returning * into report;

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
    update public.profiles
    set reports_approved = reports_approved + 1
    where id = report.reporter_id;
  elsif next_status = 'rejected' then
    update public.profiles
    set reports_rejected = reports_rejected + 1
    where id = report.reporter_id;
  end if;

  if next_status in ('approved', 'rejected') then
    perform public.refresh_reporter_accuracy(report.reporter_id);
  end if;

  insert into public.admin_actions (
    actor_id, action_type, target_profile_id, target_table, target_id, metadata
  ) values (
    admin_user_id,
    'report_reviewed',
    report.reported_user_id,
    'negative_reports',
    report.id,
    jsonb_build_object('status', next_status, 'notes', notes, 'trust_changed', next_status = 'approved')
  );

  perform public.write_moderation_audit(
    admin_user_id,
    case
      when next_status = 'approved' then 'approve_report'
      when next_status = 'rejected' then 'reject_report'
      else 'dispute_report'
    end,
    notes,
    report.reported_user_id,
    'negative_reports',
    report.id,
    prev,
    next_status
  );

  insert into public.notifications (
    recipient_id, type, title, body, source_table, source_id
  ) values
    (
      report.reporter_id,
      'negative_report_reviewed',
      'Your report was reviewed',
      'An admin reviewed your report. Rejected reports do not change Trust.',
      'negative_reports',
      report.id
    ),
    (
      report.reported_user_id,
      'negative_report_reviewed',
      'A report involving you was reviewed',
      'An admin reviewed a report involving your Passport. Trust changes only if the report was approved.',
      'negative_reports',
      report.id
    );

  return report;
end;
$$;

-- ---------------------------------------------------------------------------
-- Community reports, appeals, feedback
-- ---------------------------------------------------------------------------
create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid,
  body text not null check (char_length(body) between 8 and 1600),
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now()
);

create index if not exists community_reports_status_idx
  on public.community_reports (status, created_at asc);

create table if not exists public.moderation_appeals (
  id uuid primary key default gen_random_uuid(),
  appellant_id uuid not null references public.profiles(id) on delete cascade,
  target_table text not null,
  target_id uuid not null,
  reason text not null check (char_length(reason) between 12 and 1600),
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'accepted', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

drop trigger if exists moderation_appeals_touch_updated_at on public.moderation_appeals;
create trigger moderation_appeals_touch_updated_at
before update on public.moderation_appeals
for each row execute function public.touch_updated_at();

create index if not exists moderation_appeals_appellant_idx
  on public.moderation_appeals (appellant_id, created_at desc);
create index if not exists moderation_appeals_status_idx
  on public.moderation_appeals (status, created_at asc);

create table if not exists public.beta_feedback (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  category text not null check (category in ('bug', 'suggestion', 'feature', 'confusing_ui')),
  body text not null check (char_length(body) between 8 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists beta_feedback_created_idx
  on public.beta_feedback (created_at desc);

create or replace function public.review_community_report(
  report_id uuid,
  admin_user_id uuid,
  next_status text,
  notes text default null
)
returns public.community_reports
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.community_reports;
  prev text;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;
  if next_status not in ('approved', 'rejected', 'under_review') then
    raise exception 'invalid_status';
  end if;

  select * into rec from public.community_reports where id = report_id for update;
  if rec.id is null then
    raise exception 'report_not_found';
  end if;
  prev := rec.status;

  update public.community_reports
  set status = next_status,
      reviewed_by = admin_user_id,
      reviewed_at = now(),
      admin_notes = notes
  where id = report_id
  returning * into rec;

  perform public.write_moderation_audit(
    admin_user_id,
    'review_community_report',
    notes,
    rec.reporter_id,
    'community_reports',
    rec.id,
    prev,
    next_status
  );

  return rec;
end;
$$;

create or replace function public.review_appeal(
  appeal_id uuid,
  admin_user_id uuid,
  next_status text,
  notes text default null
)
returns public.moderation_appeals
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.moderation_appeals;
  prev text;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;
  if next_status not in ('under_review', 'accepted', 'rejected') then
    raise exception 'invalid_appeal_status';
  end if;

  select * into rec from public.moderation_appeals where id = appeal_id for update;
  if rec.id is null then
    raise exception 'appeal_not_found';
  end if;
  prev := rec.status;

  update public.moderation_appeals
  set status = next_status,
      reviewed_by = admin_user_id,
      resolution_notes = notes,
      resolved_at = case when next_status in ('accepted', 'rejected') then now() else resolved_at end
  where id = appeal_id
  returning * into rec;

  perform public.write_moderation_audit(
    admin_user_id,
    'review_appeal',
    notes,
    rec.appellant_id,
    'moderation_appeals',
    rec.id,
    prev,
    next_status
  );

  return rec;
end;
$$;

create or replace function public.flag_profile(
  target_profile_id uuid,
  admin_user_id uuid,
  reason_text text,
  disable_account boolean default false
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.profiles;
begin
  if not public.is_admin(admin_user_id) then
    raise exception 'admin_required';
  end if;

  update public.profiles
  set flagged_at = now(),
      flag_reason = reason_text,
      is_disabled = case when disable_account then true else is_disabled end
  where id = target_profile_id
  returning * into rec;

  perform public.write_moderation_audit(
    admin_user_id,
    case when disable_account then 'disable_account' else 'flag_account' end,
    reason_text,
    target_profile_id,
    'profiles',
    target_profile_id,
    'clear',
    case when disable_account then 'disabled' else 'flagged' end
  );

  return rec;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trust badges — display only, never a trust input
-- ---------------------------------------------------------------------------
alter table public.badges
  add column if not exists affects_trust boolean not null default false,
  add column if not exists category text not null default 'recognition';

insert into public.badges (id, name, description, affects_trust, category) values
  ('verified-identity', 'Verified Identity', 'Optional identity check. Does not raise Trust Score.', false, 'identity'),
  ('verified-business', 'Verified Business', 'Local business Passport. Display only.', false, 'identity'),
  ('community-leader', 'Community Leader', 'Recognized for organizing help. Not a trust rank.', false, 'recognition'),
  ('volunteer', 'Volunteer', 'Showed up for verified help. Cosmetic recognition.', false, 'recognition'),
  ('moderator', 'Moderator', 'Trust OS reviewer. Authority is not a trust bonus.', false, 'moderation'),
  ('organization', 'Organization', 'Registered group Passport. Display only.', false, 'identity'),
  ('founder', 'Founder', 'Built Trueverse. Never a trust multiplier.', false, 'recognition'),
  ('early-member', 'Early Member', 'Joined during public beta.', false, 'recognition')
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    affects_trust = false,
    category = excluded.category;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.moderation_audit_log enable row level security;
alter table public.community_reports enable row level security;
alter table public.moderation_appeals enable row level security;
alter table public.beta_feedback enable row level security;

drop policy if exists moderation_audit_log_admin_read on public.moderation_audit_log;
create policy moderation_audit_log_admin_read on public.moderation_audit_log
  for select using (public.is_admin(auth.uid()));

drop policy if exists community_reports_select on public.community_reports;
create policy community_reports_select on public.community_reports
  for select using (reporter_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists community_reports_insert on public.community_reports;
create policy community_reports_insert on public.community_reports
  for insert with check (reporter_id = auth.uid());

drop policy if exists appeals_select on public.moderation_appeals;
create policy appeals_select on public.moderation_appeals
  for select using (appellant_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists appeals_insert on public.moderation_appeals;
create policy appeals_insert on public.moderation_appeals
  for insert with check (appellant_id = auth.uid());

drop policy if exists beta_feedback_select on public.beta_feedback;
create policy beta_feedback_select on public.beta_feedback
  for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists beta_feedback_insert on public.beta_feedback;
create policy beta_feedback_insert on public.beta_feedback
  for insert with check (profile_id = auth.uid() or profile_id is null);

grant select on public.moderation_audit_log to authenticated;
grant select, insert on public.community_reports to authenticated;
grant select, insert on public.moderation_appeals to authenticated;
grant select, insert on public.beta_feedback to authenticated;

revoke update, delete on public.moderation_audit_log from authenticated, anon;
revoke update, delete on public.beta_feedback from authenticated, anon;

grant execute on function public.review_positive_trust_act(uuid, uuid, text, text) to authenticated;
grant execute on function public.review_community_report(uuid, uuid, text, text) to authenticated;
grant execute on function public.review_appeal(uuid, uuid, text, text) to authenticated;
grant execute on function public.flag_profile(uuid, uuid, text, boolean) to authenticated;
