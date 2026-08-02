create or replace function public.seed_default_challenges(target_user_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.challenges where user_id = target_user_id) then return; end if;
  insert into public.challenges (user_id, icon, title, days, progress, reward, color, done, joined) values
    (target_user_id, '🥤', 'Tanpa Sedotan Plastik', 7, 0, '150 XP + Badge', '#22c55e', false, false),
    (target_user_id, '🧴', 'Bawa Tumbler 7 Hari', 7, 0, '200 XP + Badge', '#a3e635', false, false),
    (target_user_id, '🚶', 'Jalan Kaki 5 Hari', 5, 0, '120 XP', '#34d399', false, false),
    (target_user_id, '⚡', 'Hemat Listrik Seminggu', 7, 0, '100 XP', '#fbbf24', false, false);
end;
$$;

create or replace function public.seed_new_user_challenges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.seed_default_challenges(new.id);
  return new;
end;
$$;

drop trigger if exists on_profile_created_seed_challenges on public.profiles;
create trigger on_profile_created_seed_challenges
  after insert on public.profiles
  for each row execute procedure public.seed_new_user_challenges();

-- Populate the persistent defaults for accounts that already exist.
do $$ declare profile_record record;
begin
  for profile_record in select id from public.profiles loop
    perform public.seed_default_challenges(profile_record.id);
  end loop;
end $$;
