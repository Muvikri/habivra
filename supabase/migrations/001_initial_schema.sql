-- Migration 001: Initial Schema for Habivra

-- Enable RLS on profiles if exists or create
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  level int not null default 1,
  level_name text not null default 'Pemula Hijau',
  xp int not null default 0,
  xp_to_next_level int not null default 300,
  streak int not null default 0,
  total_habits_done int not null default 0,
  avatar_url text,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  reminder_enabled boolean not null default true,
  language text not null default 'id',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- habits
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  icon text not null default '🌿',
  title text not null,
  xp int not null default 10,
  done boolean not null default false,
  description text not null default '',
  benefits text[] not null default '{}',
  impact text not null default '',
  streak_days boolean[] not null default '{false,false,false,false,false,false,false}',
  streak_count int not null default 0,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users manage own habits" on public.habits
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- challenges
create table if not exists public.challenges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  icon text not null default '🎯',
  title text not null,
  days int not null default 30,
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  reward text not null default '',
  color text not null default '#16a34a',
  done boolean not null default false,
  joined boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

create policy "Users manage own challenges" on public.challenges
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chat_messages
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_role text not null check (from_role in ('user', 'ai')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

create policy "Users manage own messages" on public.chat_messages
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- weekly_reflections
create table if not exists public.weekly_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood text not null,
  ai_response text,
  created_at timestamptz not null default now()
);

alter table public.weekly_reflections enable row level security;

create policy "Users manage own reflections" on public.weekly_reflections
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Pengguna'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
