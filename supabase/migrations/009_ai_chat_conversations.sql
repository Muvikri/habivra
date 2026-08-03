-- Keep each Eco Coach discussion separate, so only the selected chat becomes AI context.
create table if not exists public.chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Chat baru',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chat_conversations enable row level security;

drop policy if exists "Users manage own chat conversations" on public.chat_conversations;
create policy "Users manage own chat conversations" on public.chat_conversations
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.chat_messages
  add column if not exists conversation_id uuid references public.chat_conversations(id) on delete cascade;

-- Early schema versions named this column `content`, while the application uses `text`.
-- Normalize it without affecting databases that already have the current column name.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'chat_messages' and column_name = 'content'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'chat_messages' and column_name = 'text'
  ) then
    alter table public.chat_messages rename column content to text;
  end if;
end $$;

-- Place messages created before this migration in one recoverable history chat per user.
insert into public.chat_conversations (user_id, title)
select distinct message.user_id, 'Riwayat sebelumnya'
from public.chat_messages as message
where message.conversation_id is null
  and not exists (
    select 1
    from public.chat_conversations as conversation
    where conversation.user_id = message.user_id
      and conversation.title = 'Riwayat sebelumnya'
  );

with history_conversations as (
  select distinct on (user_id) id, user_id
  from public.chat_conversations
  where title = 'Riwayat sebelumnya'
  order by user_id, created_at asc
)
update public.chat_messages as message
set conversation_id = conversation.id
from history_conversations as conversation
where message.user_id = conversation.user_id
  and message.conversation_id is null;

alter table public.chat_messages
  alter column conversation_id set not null;

create index if not exists chat_conversations_user_updated_idx
  on public.chat_conversations (user_id, updated_at desc);

create index if not exists chat_messages_conversation_created_idx
  on public.chat_messages (conversation_id, created_at asc);
