-- Enable RLS and add policies for all tool tables

-- Flashcards table
alter table public.flashcards enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flashcards' and policyname = 'Users can select own flashcards'
  ) then
    create policy "Users can select own flashcards"
      on public.flashcards
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flashcards' and policyname = 'Users can insert own flashcards'
  ) then
    create policy "Users can insert own flashcards"
      on public.flashcards
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flashcards' and policyname = 'Users can update own flashcards'
  ) then
    create policy "Users can update own flashcards"
      on public.flashcards
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'flashcards' and policyname = 'Users can delete own flashcards'
  ) then
    create policy "Users can delete own flashcards"
      on public.flashcards
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Problems table
alter table public.problems enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'problems' and policyname = 'Users can select own problems'
  ) then
    create policy "Users can select own problems"
      on public.problems
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'problems' and policyname = 'Users can insert own problems'
  ) then
    create policy "Users can insert own problems"
      on public.problems
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'problems' and policyname = 'Users can update own problems'
  ) then
    create policy "Users can update own problems"
      on public.problems
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'problems' and policyname = 'Users can delete own problems'
  ) then
    create policy "Users can delete own problems"
      on public.problems
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Personality results table
alter table public.personality_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'personality_results' and policyname = 'Users can select own personality results'
  ) then
    create policy "Users can select own personality results"
      on public.personality_results
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'personality_results' and policyname = 'Users can insert own personality results'
  ) then
    create policy "Users can insert own personality results"
      on public.personality_results
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'personality_results' and policyname = 'Users can update own personality results'
  ) then
    create policy "Users can update own personality results"
      on public.personality_results
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'personality_results' and policyname = 'Users can delete own personality results'
  ) then
    create policy "Users can delete own personality results"
      on public.personality_results
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Thought labels table
alter table public.thought_labels enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'thought_labels' and policyname = 'Users can select own thought labels'
  ) then
    create policy "Users can select own thought labels"
      on public.thought_labels
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'thought_labels' and policyname = 'Users can insert own thought labels'
  ) then
    create policy "Users can insert own thought labels"
      on public.thought_labels
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'thought_labels' and policyname = 'Users can update own thought labels'
  ) then
    create policy "Users can update own thought labels"
      on public.thought_labels
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'thought_labels' and policyname = 'Users can delete own thought labels'
  ) then
    create policy "Users can delete own thought labels"
      on public.thought_labels
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Reframes table
alter table public.reframes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reframes' and policyname = 'Users can select own reframes'
  ) then
    create policy "Users can select own reframes"
      on public.reframes
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reframes' and policyname = 'Users can insert own reframes'
  ) then
    create policy "Users can insert own reframes"
      on public.reframes
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reframes' and policyname = 'Users can update own reframes'
  ) then
    create policy "Users can update own reframes"
      on public.reframes
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reframes' and policyname = 'Users can delete own reframes'
  ) then
    create policy "Users can delete own reframes"
      on public.reframes
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- Storage policies for tool-uploads bucket
-- Files are stored as: prefix/userId/filename
-- We check that the path contains the user's ID
-- Use DROP POLICY IF EXISTS to handle re-runs gracefully

drop policy if exists "Users can upload own files" on storage.objects;
create policy "Users can upload own files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'tool-uploads' 
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users can read own files" on storage.objects;
create policy "Users can read own files"
  on storage.objects
  for select
  using (
    bucket_id = 'tool-uploads' 
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users can update own files" on storage.objects;
create policy "Users can update own files"
  on storage.objects
  for update
  using (
    bucket_id = 'tool-uploads' 
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "Users can delete own files" on storage.objects;
create policy "Users can delete own files"
  on storage.objects
  for delete
  using (
    bucket_id = 'tool-uploads' 
    and (storage.foldername(name))[2] = auth.uid()::text
  );
