-- Persist the user's chosen local-notification time (24-hour local device time).
alter table public.profiles
  add column if not exists reminder_hour smallint not null default 20
    check (reminder_hour between 0 and 23),
  add column if not exists reminder_minute smallint not null default 0
    check (reminder_minute between 0 and 59);
