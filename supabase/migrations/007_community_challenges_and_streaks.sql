-- Global, time-bound events managed by an administrator.
-- Disable the legacy per-user seeding model; the old table is retained for compatibility.
drop trigger if exists on_profile_created_seed_challenges on public.profiles;

create table if not exists public.community_challenges (
  id uuid primary key default gen_random_uuid(),
  icon text not null default '🏆',
  title text not null,
  days int not null check (days > 0),
  reward text not null default '',
  color text not null default '#16a34a',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.challenge_participants (
  challenge_id uuid references public.community_challenges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  progress int not null default 0 check (progress between 0 and 100),
  done boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

alter table public.community_challenges enable row level security;
alter table public.challenge_participants enable row level security;

create policy "Anyone can view published community challenges" on public.community_challenges
  for select using (is_published = true);
create policy "Users can view own challenge participation" on public.challenge_participants
  for select using (auth.uid() = user_id);
create policy "Users can join community challenges" on public.challenge_participants
  for insert with check (auth.uid() = user_id);
create policy "Users can update own challenge participation" on public.challenge_participants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Keep profiles.streak as the single streak value used by every screen.
create or replace function public.refresh_profile_streak(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  streak_day date := current_date;
  streak_total integer := 0;
begin
  if not exists (
    select 1 from public.habit_logs
    where user_id = target_user_id and completed_on = streak_day
  ) then
    streak_day := streak_day - 1;
  end if;

  while exists (
    select 1 from public.habit_logs
    where user_id = target_user_id and completed_on = streak_day
  ) loop
    streak_total := streak_total + 1;
    streak_day := streak_day - 1;
  end loop;

  update public.profiles
  set streak = streak_total, updated_at = now()
  where id = target_user_id;
end;
$$;

create or replace function public.sync_profile_streak_from_habit_log()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_streak(old.user_id);
    return old;
  end if;

  perform public.refresh_profile_streak(new.user_id);
  if tg_op = 'UPDATE' and new.user_id <> old.user_id then
    perform public.refresh_profile_streak(old.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists habit_logs_sync_profile_streak on public.habit_logs;
create trigger habit_logs_sync_profile_streak
  after insert or delete or update of user_id, completed_on on public.habit_logs
  for each row execute procedure public.sync_profile_streak_from_habit_log();

-- One-off synchronization for existing history.
do $$ declare profile_record record;
begin
  for profile_record in select id from public.profiles loop
    perform public.refresh_profile_streak(profile_record.id);
  end loop;
end $$;
