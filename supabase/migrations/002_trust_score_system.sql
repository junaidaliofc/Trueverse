-- Trueverse trust score system.
--
-- Rules implemented here:
--   * Starting score = 50                 (already the default on public.profiles)
--   * Positive accepted                   -> +3 to the submitter
--   * Negative verified                   -> -5 to the reported user (base)
--       - reporter trust_score > 80       -> double weight  (-10)
--       - reporter trust_score < 30       -> half weight    (-3, round half away from zero)
--   * Maximum 5 accepted positives from the same submitter to the same
--     recipient within a rolling 6 months (the 6th is blocked)
--   * Every score change is stored in public.trust_history

-- Canonical ledger of every trust score change.
create table if not exists public.trust_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  base_delta integer not null,
  weight numeric(4, 2) not null default 1,
  score_before integer not null,
  score_after integer not null,
  reason public.trust_event_reason not null,
  source_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists trust_history_profile_created_idx
  on public.trust_history(profile_id, created_at desc);

alter table public.trust_history enable row level security;

drop policy if exists "trust history visible to owner and admins" on public.trust_history;
create policy "trust history visible to owner and admins"
on public.trust_history for select
using (auth.uid() = profile_id or public.is_admin(auth.uid()));

-- Apply a weighted trust delta, clamp the score to [0, 1000], keep the streak in
-- sync, and record the change in trust_history (and the legacy trust_score_events
-- ledger for backward compatibility). The final delta is round(base_delta * weight).
drop function if exists public.apply_trust_delta(uuid, integer, public.trust_event_reason, uuid, uuid);

create or replace function public.apply_trust_delta(
  target_profile_id uuid,
  base_delta integer,
  weight numeric,
  event_reason public.trust_event_reason,
  event_source_id uuid,
  actor_id uuid,
  event_note text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_score integer;
  next_score integer;
  final_delta integer;
begin
  final_delta := round(base_delta * weight)::integer;

  select trust_score into current_score
  from public.profiles
  where id = target_profile_id
  for update;

  if current_score is null then
    raise exception 'profile_not_found';
  end if;

  next_score := greatest(0, least(1000, current_score + final_delta));

  update public.profiles
  set trust_score = next_score,
      streak = case
        when final_delta > 0 then streak + 1
        when final_delta < 0 then 0
        else streak
      end,
      last_positive_at = case
        when final_delta > 0 then now()
        else last_positive_at
      end
  where id = target_profile_id;

  insert into public.trust_history (
    profile_id,
    delta,
    base_delta,
    weight,
    score_before,
    score_after,
    reason,
    source_id,
    created_by,
    note
  )
  values (
    target_profile_id,
    final_delta,
    base_delta,
    weight,
    current_score,
    next_score,
    event_reason,
    event_source_id,
    actor_id,
    event_note
  );

  -- Legacy ledger kept in sync for backward compatibility.
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
    final_delta,
    next_score,
    event_reason,
    event_source_id,
    actor_id
  );

  return next_score;
end;
$$;

-- Accepting a positive interaction gives the submitter +3, but only up to 5
-- accepted positives from the same submitter to the same recipient per 6 months.
create or replace function public.accept_positive_interaction(interaction_id uuid, accepting_user_id uuid)
returns public.positive_interactions
language plpgsql
security definer
set search_path = public
as $$
declare
  interaction public.positive_interactions;
  recent_count integer;
begin
  select *
  into interaction
  from public.positive_interactions
  where id = interaction_id
    and recipient_id = accepting_user_id
    and status = 'pending'
  for update;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

  select count(*)
  into recent_count
  from public.positive_interactions
  where author_id = interaction.author_id
    and recipient_id = interaction.recipient_id
    and status = 'accepted'
    and accepted_at >= now() - interval '6 months';

  if recent_count >= 5 then
    raise exception 'positive_limit_reached';
  end if;

  update public.positive_interactions
  set status = 'accepted',
      accepted_at = now()
  where id = interaction.id
  returning * into interaction;

  perform public.apply_trust_delta(
    interaction.author_id,
    3,
    1,
    'positive_interaction',
    interaction.id,
    accepting_user_id,
    null
  );

  return interaction;
end;
$$;

-- Approving a negative report subtracts a reporter-weighted penalty from the
-- reported user: base -5, doubled when the reporter's trust > 80, halved when < 30.
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
  reporter_trust integer;
  penalty_weight numeric;
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
    select trust_score into reporter_trust
    from public.profiles
    where id = report.reporter_id;

    penalty_weight := case
      when reporter_trust > 80 then 2.0
      when reporter_trust < 30 then 0.5
      else 1.0
    end;

    perform public.apply_trust_delta(
      report.reported_user_id,
      -5,
      penalty_weight,
      'negative_report',
      report.id,
      admin_user_id,
      format('reporter_trust=%s weight=%s', reporter_trust, penalty_weight)
    );
  end if;

  return report;
end;
$$;
