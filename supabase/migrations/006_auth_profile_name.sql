-- Preserve signup name from auth metadata (name or full_name).
-- auth.users.id remains the canonical profiles.id.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
begin
  meta_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'full_name',
        ''
      )
    ),
    ''
  );

  insert into public.profiles (id, email, full_name, photo_url)
  values (
    new.id,
    new.email,
    coalesce(meta_name, ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case
        when public.profiles.full_name = '' then excluded.full_name
        else public.profiles.full_name
      end,
      photo_url = coalesce(public.profiles.photo_url, excluded.photo_url);

  return new;
end;
$$;
