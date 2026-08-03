-- Username-first accounts. Authentication continues to use Supabase credentials,
-- while the generated internal email is never exposed in the app UI.
alter table public.profiles
  add column if not exists username text,
  add column if not exists is_guest boolean not null default false;

update public.profiles
set name = 'Pengunjung'
where is_guest = true and btrim(name) = '';

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[a-z0-9_]{3,20}$') not valid;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username, is_guest)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'name', ''),
      case when new.is_anonymous then 'Pengunjung' else 'Pengguna' end
    ),
    nullif(lower(new.raw_user_meta_data->>'username'), ''),
    coalesce((new.raw_user_meta_data->>'is_guest')::boolean, new.is_anonymous)
  );
  return new;
end;
$$;
