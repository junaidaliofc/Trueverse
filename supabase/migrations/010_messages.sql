-- Sprint 6: Direct messages (1:1). Members only. No realtime.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  direct_key text not null unique,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  unread_count integer not null default 0 check (unread_count >= 0),
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  image_url text check (image_url is null or char_length(image_url) <= 2048),
  created_at timestamptz not null default now()
);

create index if not exists conversations_last_message_idx
  on public.conversations (last_message_at desc nulls last);
create index if not exists conversation_members_profile_idx
  on public.conversation_members (profile_id, unread_count desc);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

create trigger conversations_touch_updated_at
before update on public.conversations
for each row execute function public.touch_updated_at();

create or replace function public.is_conversation_member(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members
    where conversation_id = conv
      and profile_id = auth.uid()
  );
$$;

create or replace function public.get_or_create_direct_conversation(peer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  conv_id uuid;
  key text;
begin
  if me is null then
    raise exception 'not authenticated';
  end if;
  if peer_id is null or peer_id = me then
    raise exception 'cannot message this member';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = peer_id and is_disabled = false
  ) then
    raise exception 'member not found';
  end if;

  key := least(me::text, peer_id::text) || ':' || greatest(me::text, peer_id::text);

  select id into conv_id
  from public.conversations
  where direct_key = key;

  if conv_id is not null then
    return conv_id;
  end if;

  insert into public.conversations (direct_key)
  values (key)
  returning id into conv_id;

  insert into public.conversation_members (conversation_id, profile_id)
  values (conv_id, me), (conv_id, peer_id);

  return conv_id;
end;
$$;

create or replace function public.on_direct_message_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_preview = left(btrim(new.body), 140),
    updated_at = now()
  where id = new.conversation_id;

  update public.conversation_members
  set unread_count = unread_count + 1
  where conversation_id = new.conversation_id
    and profile_id <> new.sender_id;

  return new;
end;
$$;

drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert
after insert on public.messages
for each row execute function public.on_direct_message_insert();

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy conversations_select_member on public.conversations
  for select using (public.is_conversation_member(id));

create policy conversation_members_select_member on public.conversation_members
  for select using (public.is_conversation_member(conversation_id));

create policy conversation_members_update_self on public.conversation_members
  for update using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy messages_select_member on public.messages
  for select using (public.is_conversation_member(conversation_id));

create policy messages_insert_self on public.messages
  for insert with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id)
  );

revoke all on function public.is_conversation_member(uuid) from public;
grant execute on function public.is_conversation_member(uuid) to authenticated;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

create or replace function public.find_member_by_email(lookup_email text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  found uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if lookup_email is null or position('@' in lookup_email) = 0 then
    return null;
  end if;

  select id into found
  from public.profiles
  where email = btrim(lookup_email)
    and is_disabled = false
    and id <> auth.uid()
  limit 1;

  return found;
end;
$$;

revoke all on function public.find_member_by_email(text) from public;
grant execute on function public.find_member_by_email(text) to authenticated;

grant select on table public.conversations to authenticated;
grant select, update on table public.conversation_members to authenticated;
grant select, insert on table public.messages to authenticated;

comment on table public.conversations is
  '1:1 direct conversations. Visible only to members.';
comment on table public.messages is
  'Direct messages. Not realtime in Sprint 6. Never mutates trust.';
comment on function public.find_member_by_email(text) is
  'Private email lookup for starting a conversation. Never returns the email.';
