-- Passport MVP profile fields (public-safe identity details)
alter table public.profiles
  add column if not exists city text
    check (city is null or char_length(city) <= 80),
  add column if not exists headline text
    check (headline is null or char_length(headline) <= 120),
  add column if not exists interests text[] not null default '{}'::text[],
  add column if not exists social_links jsonb not null default '{}'::jsonb;
