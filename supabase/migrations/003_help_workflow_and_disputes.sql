-- Public help-request workflow + admin dispute resolution.
--
-- Help requests gain a lifecycle: open -> accepted (a helper claims it) ->
-- completed (the requester confirms). On completion the helper is automatically
-- credited with an accepted positive interaction (+3 trust).
--
-- Disputes let a reported user challenge a report; admins resolve or reject them,
-- optionally restoring the score that an unfair report deducted.

-- ---------------------------------------------------------------------------
-- Help-request lifecycle
-- ---------------------------------------------------------------------------
create type public.help_request_status as enum ('open', 'accepted', 'completed', 'cancelled');

alter table public.help_requests
  add column if not exists status public.help_request_status not null default 'open',
  add column if not exists helper_id uuid references public.profiles(id) on delete set null,
  add column if not exists accepted_at timestamptz,
  add column if not exists completed_at timestamptz;

create index if not exists help_requests_status_idx on public.help_requests(status, created_at desc);
create index if not exists help_requests_helper_idx on public.help_requests(helper_id);

-- A helper claims an open request.
create or replace function public.accept_help_request(request_id uuid, helper_user_id uuid)
returns public.help_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.help_requests;
begin
  select * into req from public.help_requests where id = request_id for update;

  if req.id is null then
    raise exception 'help_request_not_found';
  end if;
  if req.status <> 'open' then
    raise exception 'help_request_not_open';
  end if;
  if req.author_id = helper_user_id then
    raise exception 'cannot_accept_own_request';
  end if;

  update public.help_requests
  set status = 'accepted',
      helper_id = helper_user_id,
      accepted_at = now(),
      is_open = false
  where id = request_id
  returning * into req;

  return req;
end;
$$;

-- The requester confirms completion; the helper is auto-credited with +3.
create or replace function public.complete_help_request(request_id uuid, requester_user_id uuid)
returns public.help_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.help_requests;
  new_interaction public.positive_interactions;
begin
  select * into req from public.help_requests where id = request_id for update;

  if req.id is null then
    raise exception 'help_request_not_found';
  end if;
  if req.author_id <> requester_user_id then
    raise exception 'only_requester_can_complete';
  end if;
  if req.status <> 'accepted' then
    raise exception 'help_request_not_accepted';
  end if;
  if req.helper_id is null then
    raise exception 'help_request_has_no_helper';
  end if;

  update public.help_requests
  set status = 'completed',
      completed_at = now(),
      is_open = false
  where id = request_id
  returning * into req;

  -- Auto-create an accepted positive interaction crediting the helper.
  insert into public.positive_interactions (
    author_id,
    recipient_id,
    title,
    description,
    status,
    accepted_at
  )
  values (
    req.helper_id,
    req.author_id,
    left('Helped: ' || req.title, 120),
    'Automatically recognized for completing a community help request.',
    'accepted',
    now()
  )
  returning * into new_interaction;

  perform public.apply_trust_delta(
    req.helper_id,
    3,
    1,
    'positive_interaction',
    new_interaction.id,
    requester_user_id,
    'help_request_completed'
  );

  return req;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dispute resolution
-- ---------------------------------------------------------------------------
-- An admin resolves (upholds) or rejects a dispute. Resolving marks the related
-- report as rejected and, when restore_score is true, credits back the score the
-- report deducted (as an audited admin_adjustment).
create or replace function public.resolve_dispute(
  dispute_id uuid,
  admin_user_id uuid,
  next_status public.dispute_status,
  notes text default null,
  restore_score boolean default true
)
returns public.disputes
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.disputes;
  rep public.negative_reports;
  penalty integer;
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
    and status = 'open'
  returning * into d;

  if d.id is null then
    raise exception 'dispute_not_found_or_closed';
  end if;

  if next_status = 'resolved' then
    select * into rep from public.negative_reports where id = d.report_id;

    if rep.id is not null then
      update public.negative_reports
      set status = 'rejected',
          reviewed_by = admin_user_id,
          reviewed_at = now()
      where id = rep.id;

      if restore_score then
        select coalesce(sum(delta), 0) into penalty
        from public.trust_history
        where source_id = rep.id
          and reason = 'negative_report';

        if penalty < 0 then
          perform public.apply_trust_delta(
            rep.reported_user_id,
            -penalty,
            1,
            'admin_adjustment',
            rep.id,
            admin_user_id,
            'dispute_resolved_restore'
          );
        end if;
      end if;
    end if;
  end if;

  return d;
end;
$$;
