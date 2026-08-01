-- Persist first-time setup status for each account.
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- The application model uses `desc`; align existing databases that were
-- created from the first migration, which named this column `description`.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'habits' and column_name = 'description'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'habits' and column_name = 'desc'
  ) then
    alter table public.habits rename column description to "desc";
  end if;
end $$;
