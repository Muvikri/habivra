create table if not exists public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, habit_id, completed_on)
);

alter table public.habit_logs enable row level security;

create policy "Users manage own habit logs" on public.habit_logs
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists habit_logs_user_date_idx on public.habit_logs (user_id, completed_on desc);
