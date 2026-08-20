-- Sprint 2: Community feed (posts, comments, reactions, bookmarks)
-- Social engagement must NEVER mutate trust_score / trust_index.

create type public.community_post_type as enum (
  'trust_act',
  'update',
  'help',
  'event'
);

create type public.community_moderation_status as enum (
  'visible',
  'pending_review',
  'removed'
);

create type public.community_reaction_type as enum (
  'like',
  'appreciate'
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  post_type public.community_post_type not null default 'update',
  title text check (title is null or char_length(title) <= 120),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  trust_act_id uuid references public.positive_interactions(id) on delete set null,
  is_hidden boolean not null default false,
  moderation_status public.community_moderation_status not null default 'visible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 800),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type public.community_reaction_type not null,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id, reaction_type)
);

create table if not exists public.community_bookmarks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, post_id)
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);
create index if not exists community_posts_author_created_idx
  on public.community_posts (author_id, created_at desc);
create index if not exists community_posts_visible_created_idx
  on public.community_posts (created_at desc)
  where is_hidden = false and moderation_status = 'visible';
create index if not exists community_comments_post_created_idx
  on public.community_comments (post_id, created_at asc);
create index if not exists community_reactions_post_idx
  on public.community_reactions (post_id, reaction_type);
create index if not exists community_bookmarks_profile_idx
  on public.community_bookmarks (profile_id, created_at desc);

create trigger community_posts_touch_updated_at
before update on public.community_posts
for each row execute function public.touch_updated_at();

create trigger community_comments_touch_updated_at
before update on public.community_comments
for each row execute function public.touch_updated_at();

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_bookmarks enable row level security;

-- Posts: public can read non-hidden visible posts; authors/admins see their own/hidden.
create policy community_posts_select on public.community_posts
  for select using (
    (
      is_hidden = false
      and moderation_status = 'visible'
    )
    or auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

create policy community_posts_insert on public.community_posts
  for insert with check (
    auth.uid() = author_id
    and auth.uid() is not null
  );

create policy community_posts_update on public.community_posts
  for update using (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

create policy community_posts_delete on public.community_posts
  for delete using (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

-- Comments
create policy community_comments_select on public.community_comments
  for select using (
    is_hidden = false
    or auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

create policy community_comments_insert on public.community_comments
  for insert with check (
    auth.uid() = author_id
    and auth.uid() is not null
  );

create policy community_comments_update on public.community_comments
  for update using (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  )
  with check (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

create policy community_comments_delete on public.community_comments
  for delete using (
    auth.uid() = author_id
    or public.is_admin(auth.uid())
  );

-- Reactions (social only — never trust)
create policy community_reactions_select on public.community_reactions
  for select using (true);

create policy community_reactions_insert on public.community_reactions
  for insert with check (
    auth.uid() = profile_id
    and auth.uid() is not null
  );

create policy community_reactions_delete on public.community_reactions
  for delete using (
    auth.uid() = profile_id
    or public.is_admin(auth.uid())
  );

-- Bookmarks are private to the owner
create policy community_bookmarks_select on public.community_bookmarks
  for select using (
    auth.uid() = profile_id
    or public.is_admin(auth.uid())
  );

create policy community_bookmarks_insert on public.community_bookmarks
  for insert with check (
    auth.uid() = profile_id
    and auth.uid() is not null
  );

create policy community_bookmarks_delete on public.community_bookmarks
  for delete using (
    auth.uid() = profile_id
    or public.is_admin(auth.uid())
  );

comment on table public.community_posts is
  'Community feed posts. Reactions/engagement must never mutate trust.';
comment on table public.community_reactions is
  'Social reactions only. Does not affect trust_score or trust_index.';
