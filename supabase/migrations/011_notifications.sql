-- Sprint 7: Notification center categories, preferences, and delete.
-- Extends existing public.notifications. Does not mutate trust.

alter table public.notifications
  add column if not exists category text not null default 'system';

alter table public.notifications drop constraint if exists notifications_category_check;
alter table public.notifications
  add constraint notifications_category_check
  check (category in ('social', 'trust', 'community', 'system', 'messages'));

alter table public.notifications
  add column if not exists event_key text;

alter table public.notifications
  add column if not exists href text;

alter table public.notifications
  add column if not exists actor_id uuid references public.profiles(id) on delete set null;

alter table public.notifications
  add column if not exists deleted_at timestamptz;

create index if not exists notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc)
  where deleted_at is null;

create index if not exists notifications_recipient_category_idx
  on public.notifications (recipient_id, category, created_at desc)
  where deleted_at is null;

create index if not exists notifications_recipient_unread_alive_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null and deleted_at is null;

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  social boolean not null default true,
  trust boolean not null default true,
  community boolean not null default true,
  system boolean not null default true,
  messages boolean not null default true,
  email_digest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences
  add column if not exists messages boolean not null default true;

drop trigger if exists notification_preferences_touch_updated_at on public.notification_preferences;
create trigger notification_preferences_touch_updated_at
before update on public.notification_preferences
for each row execute function public.touch_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own on public.notification_preferences
  for select using (profile_id = auth.uid());

drop policy if exists notification_preferences_upsert_own on public.notification_preferences;
drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own on public.notification_preferences
  for insert with check (profile_id = auth.uid());

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own on public.notification_preferences
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists "recipients can delete notifications" on public.notifications;
create policy "recipients can delete notifications"
on public.notifications for delete
using (auth.uid() = recipient_id);

grant select, update, delete on table public.notifications to authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;

comment on table public.notification_preferences is
  'Per-member notification category switches. Owner access only.';
comment on column public.notifications.category is
  'Inbox filter: social, trust, or messages. Legacy community/system values map in the app. Never mutates trust.';
