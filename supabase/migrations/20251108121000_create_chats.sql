create extension if not exists "pgcrypto";

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tab text not null check (tab in ('academic', 'mindfulness')),
  title text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_user_id_idx on public.chats (user_id, tab, updated_at desc);

create or replace function public.handle_chats_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_chats_updated_at on public.chats;

create trigger on_chats_updated_at
  before update on public.chats
  for each row
  execute function public.handle_chats_updated_at();

alter table public.chats enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can select own chats'
  ) then
    create policy "Users can select own chats"
      on public.chats
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can insert own chats'
  ) then
    create policy "Users can insert own chats"
      on public.chats
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can update own chats'
  ) then
    create policy "Users can update own chats"
      on public.chats
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can delete own chats'
  ) then
    create policy "Users can delete own chats"
      on public.chats
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

