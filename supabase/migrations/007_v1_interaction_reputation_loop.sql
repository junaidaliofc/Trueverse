-- Trueverse V1 — Core interaction + reputation loop for public beta.
--
-- Goals:
--   * User-facing "Interaction" model on top of the legacy positive_interactions table.
--   * Confirmation flow that records verified-interaction evidence for both participants.
--   * Anti-farming: at most one reputation-credited confirmation per unordered pair of
--     users in a rolling 30-day window. Extra confirmations are stored/displayed but
--     receive zero trust delta.
--   * Structured, non-social "References" with a hard anti-inflation constraint.
--   * The legacy trust_score / +3 mechanism stays internal for backward compatibility.
--
-- This migration is additive. It does not rewrite prior migration history or drop columns.

-- ---------------------------------------------------------------------------
-- 0) Defensive: ensure a no-argument is_admin() exists (used by RLS + triggers).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin(auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 1) Interaction category + reputation eligibility on the legacy table.
-- ---------------------------------------------------------------------------
do $$
begin
  create type public.interaction_category as enum (
    'marketplace',
    'professional',
    'service',
    'community',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

alter table public.positive_interactions
  add column if not exists category public.interaction_category not null default 'other',
  add column if not exists reputation_eligible boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2) Allow trusted SECURITY DEFINER routines to write protected profile
--    counters (trust_acts / trust_score) via a transaction-local flag, while
--    still blocking direct client tampering.
-- ---------------------------------------------------------------------------
create or replace function public.protect_extended_profile_fields()
returns trigger
language plpgsql
as $$
begin
  -- Trusted server-side routines opt in explicitly; the flag is transaction-local.
  if coalesce(current_setting('trueverse.allow_trust_write', true), '') = 'on' then
    return new;
  end if;

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

-- ---------------------------------------------------------------------------
-- 3) Confirm an interaction (recipient confirms it occurred).
--    Idempotent, authorization-checked, with server-side anti-farming.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_positive_interaction(
  interaction_id uuid,
  confirming_user_id uuid
)
returns public.positive_interactions
language plpgsql
security definer
set search_path = public
as $$
declare
  interaction public.positive_interactions;
  pair_recently_credited boolean;
  eligible boolean;
begin
  perform public.ensure_active_user(confirming_user_id);

  -- Only the recipient may confirm, only while still pending and unexpired.
  -- The status guard makes confirmation idempotent: a second call finds no
  -- pending row and raises, so reputation can never be awarded twice.
  update public.positive_interactions
  set status = 'accepted',
      accepted_at = now()
  where id = interaction_id
    and recipient_id = confirming_user_id
    and status = 'pending'
    and expires_at > now()
  returning * into interaction;

  if interaction.id is null then
    raise exception 'interaction_not_found_or_not_pending';
  end if;

  if interaction.author_id = interaction.recipient_id then
    raise exception 'self_interaction_not_allowed';
  end if;

  -- Anti-farming: has this unordered pair already earned reputation credit in
  -- the last 30 days?
  select exists (
    select 1
    from public.positive_interactions pi
    where pi.id <> interaction.id
      and pi.status = 'accepted'
      and pi.reputation_eligible = true
      and pi.accepted_at > (now() - interval '30 days')
      and (
        (pi.author_id = interaction.author_id and pi.recipient_id = interaction.recipient_id)
        or (pi.author_id = interaction.recipient_id and pi.recipient_id = interaction.author_id)
      )
  ) into pair_recently_credited;

  eligible := not pair_recently_credited;

  perform set_config('trueverse.allow_trust_write', 'on', true);

  update public.positive_interactions
  set reputation_eligible = eligible
  where id = interaction.id
  returning * into interaction;

  -- Verified-interaction evidence grows for both participants (a count, not a score).
  update public.profiles
  set trust_acts = trust_acts + 1
  where id in (interaction.author_id, interaction.recipient_id);

  -- Legacy internal +3 stays for backward compatibility, gated by the 30-day rule.
  if eligible then
    perform public.apply_trust_delta(
      interaction.author_id,
      3,
      'positive_interaction',
      'positive_interactions',
      interaction.id,
      confirming_user_id,
      'Confirmed interaction (reputation eligible)'
    );
  end if;

  perform set_config('trueverse.allow_trust_write', 'off', true);

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
    'Interaction confirmed',
    case
      when eligible then
        'Your interaction was confirmed and added to your verified reputation evidence.'
      else
        'Your interaction was confirmed and recorded. Reputation credit is limited to one confirmation per person every 30 days.'
    end,
    'positive_interactions',
    interaction.id
  );

  return interaction;
end;
$$;

revoke all on function public.confirm_positive_interaction(uuid, uuid) from public;
grant execute on function public.confirm_positive_interaction(uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4) References — structured, non-social reputation context.
--    References never touch trust_score. One reference per (author, subject)
--    hard-caps inflation; re-submitting updates the existing reference.
-- ---------------------------------------------------------------------------
do $$
begin
  create type public.reference_relationship as enum (
    'worked_together',
    'bought_sold',
    'professional',
    'community',
    'other'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.passport_references (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.profiles(id) on delete cascade,
  relationship public.reference_relationship not null default 'other',
  reliable boolean not null default false,
  communicated_clearly boolean not null default false,
  followed_through boolean not null default false,
  would_interact_again boolean not null default false,
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint passport_references_no_self check (author_id <> subject_id),
  constraint passport_references_unique_pair unique (author_id, subject_id)
);

create index if not exists passport_references_subject_idx
  on public.passport_references(subject_id, created_at desc);

alter table public.passport_references enable row level security;

create policy passport_references_public_read on public.passport_references
  for select using (true);

create policy passport_references_delete_own on public.passport_references
  for delete using (auth.uid() = author_id);

create trigger passport_references_touch_updated_at
  before update on public.passport_references
  for each row execute function public.touch_updated_at();

create or replace function public.submit_reference(
  subject_id uuid,
  relationship public.reference_relationship,
  reliable boolean,
  communicated_clearly boolean,
  followed_through boolean,
  would_interact_again boolean,
  note text
)
returns public.passport_references
language plpgsql
security definer
set search_path = public
as $$
declare
  reference public.passport_references;
  author uuid := auth.uid();
begin
  if author is null then
    raise exception 'authentication_required';
  end if;

  perform public.ensure_active_user(author);

  if author = subject_id then
    raise exception 'self_reference_not_allowed';
  end if;

  if not exists (
    select 1 from public.profiles p where p.id = subject_id and p.is_disabled = false
  ) then
    raise exception 'subject_not_found';
  end if;

  insert into public.passport_references as r (
    author_id,
    subject_id,
    relationship,
    reliable,
    communicated_clearly,
    followed_through,
    would_interact_again,
    note
  )
  values (
    author,
    subject_id,
    coalesce(relationship, 'other'),
    coalesce(reliable, false),
    coalesce(communicated_clearly, false),
    coalesce(followed_through, false),
    coalesce(would_interact_again, false),
    nullif(btrim(coalesce(note, '')), '')
  )
  on conflict (author_id, subject_id) do update
  set relationship = excluded.relationship,
      reliable = excluded.reliable,
      communicated_clearly = excluded.communicated_clearly,
      followed_through = excluded.followed_through,
      would_interact_again = excluded.would_interact_again,
      note = excluded.note,
      updated_at = now()
  returning * into reference;

  return reference;
end;
$$;

revoke all on function public.submit_reference(
  uuid, public.reference_relationship, boolean, boolean, boolean, boolean, text
) from public;
grant execute on function public.submit_reference(
  uuid, public.reference_relationship, boolean, boolean, boolean, boolean, text
) to authenticated, service_role;
