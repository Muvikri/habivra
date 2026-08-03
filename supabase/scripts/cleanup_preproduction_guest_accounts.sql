-- MANUAL, ONE-TIME PRE-PRODUCTION CLEANUP.
-- Run this file once in Supabase SQL Editor before publishing the app.
-- Do not add it to the migrations folder: it deletes authentication accounts.
--
-- It removes only:
--   1. Profiles explicitly marked as guests that have no username, and
--   2. Orphan anonymous Auth users that have no profile.
--
-- Deleting auth.users cascades to profiles and then to their habits, logs,
-- chats, and other user-owned data.

begin;

-- Preview the exact number of accounts that will be deleted.
with guest_accounts as (
  select profile.id
  from public.profiles as profile
  where profile.is_guest = true
    and coalesce(nullif(btrim(profile.username), ''), '') = ''

  union

  select auth_user.id
  from auth.users as auth_user
  left join public.profiles as profile on profile.id = auth_user.id
  where profile.id is null
    and auth_user.is_anonymous = true
)
select count(*) as guest_accounts_to_delete
from guest_accounts;

-- Permanently delete only the accounts selected above.
-- Rows returned here are the deleted Auth account IDs.
with guest_accounts as (
  select profile.id
  from public.profiles as profile
  where profile.is_guest = true
    and coalesce(nullif(btrim(profile.username), ''), '') = ''

  union

  select auth_user.id
  from auth.users as auth_user
  left join public.profiles as profile on profile.id = auth_user.id
  where profile.id is null
    and auth_user.is_anonymous = true
)
delete from auth.users as auth_user
using guest_accounts
where auth_user.id = guest_accounts.id
returning auth_user.id;

commit;
