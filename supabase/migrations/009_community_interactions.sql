-- Sprint 5: Community interactions (achievement type, category, location)
-- Social engagement must NEVER mutate trust_score / trust_index.

alter type public.community_post_type add value if not exists 'achievement';

alter table public.community_posts
  add column if not exists category text,
  add column if not exists location text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'community_posts_category_len'
  ) then
    alter table public.community_posts
      add constraint community_posts_category_len
      check (category is null or char_length(trim(category)) between 1 and 40);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'community_posts_location_len'
  ) then
    alter table public.community_posts
      add constraint community_posts_location_len
      check (location is null or char_length(location) <= 80);
  end if;
end $$;

comment on column public.community_posts.category is
  'Optional presentation category. Does not affect trust.';
comment on column public.community_posts.location is
  'Optional free-text location. Does not affect trust.';
