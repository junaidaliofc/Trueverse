-- Milestone 3: Trueverse Passport
-- Premium digital identity surfaces: verifications, privacy, presentation DNA.
-- Trust / DNA remain server-authored. Users cannot edit DNA dimensions.
-- XP never mutates trust_index / trust_level.

create type public.verification_kind as enum (
  'email',
  'phone',
  'identity',
  'professional',
  'community',
  'organization'
);

create type public.verification_status as enum (
  'verified',
  'pending',
  'unverified'
);

-- Per-profile verification rows (server writes only via security definer / service role)
create table if not exists public.profile_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind public.verification_kind not null,
  status public.verification_status not null default 'unverified',
  detail text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, kind)
);

create index if not exists profile_verifications_profile_idx
  on public.profile_verifications(profile_id, status);

-- Section-level Passport privacy (public share respects these)
create table if not exists public.passport_privacy (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  show_dna boolean not null default true,
  show_verifications boolean not null default true,
  show_badges boolean not null default true,
  show_timeline boolean not null default true,
  show_statistics boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Presentation Integrity dimension for Passport DNA (server-computed; not user-editable)
alter table public.reputation_dna
  add column if not exists integrity integer not null default 0
    check (integrity between 0 and 100);

-- Passport stats cache (denormalized counts for public Passport)
alter table public.profiles
  add column if not exists unique_contributors integer not null default 0
    check (unique_contributors >= 0),
  add column if not exists references_count integer not null default 0
    check (references_count >= 0),
  add column if not exists missions_completed integer not null default 0
    check (missions_completed >= 0);

alter table public.profile_verifications enable row level security;
alter table public.passport_privacy enable row level security;

-- Anyone can read verification status for public Passports (no private contact payloads)
create policy profile_verifications_read on public.profile_verifications
  for select using (true);

-- Members update only their own privacy toggles
create policy passport_privacy_read on public.passport_privacy
  for select using (true);

create policy passport_privacy_upsert_own on public.passport_privacy
  for insert with check (auth.uid() = profile_id);

create policy passport_privacy_update_own on public.passport_privacy
  for update using (auth.uid() = profile_id);

-- Recompute Integrity from honesty / communication / professionalism / safety signals.
-- Clients never write this column directly.
create or replace function public.refresh_passport_integrity(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reputation_dna d
  set
    integrity = greatest(
      0,
      least(
        100,
        round((coalesce(d.communication, 0) + coalesce(d.professionalism, 0) + coalesce(d.safety, 0)) / 3.0)
      )
    )::integer,
    updated_at = now()
  where d.profile_id = target_profile_id;
end;
$$;

revoke all on function public.refresh_passport_integrity(uuid) from public;
grant execute on function public.refresh_passport_integrity(uuid) to authenticated, service_role;

-- Seed default privacy + verification rows for new profiles
create or replace function public.ensure_passport_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.passport_privacy (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  insert into public.profile_verifications (profile_id, kind, status)
  values
    (new.id, 'email', 'unverified'),
    (new.id, 'phone', 'unverified'),
    (new.id, 'identity', 'unverified'),
    (new.id, 'professional', 'unverified'),
    (new.id, 'community', 'unverified'),
    (new.id, 'organization', 'unverified')
  on conflict (profile_id, kind) do nothing;

  insert into public.reputation_dna (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_passport_defaults on public.profiles;
create trigger profiles_passport_defaults
  after insert on public.profiles
  for each row execute function public.ensure_passport_defaults();
