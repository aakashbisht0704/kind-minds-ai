-- Create quizzes table for storing quiz sets generated from documents
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  source_file_path text,
  questions jsonb not null, -- Array of quiz questions with options and correct answer
  created_at timestamptz not null default now()
);

create index if not exists quizzes_user_id_idx on public.quizzes (user_id, created_at desc);

-- Create quiz_attempts table for tracking user quiz attempts and scores
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null, -- Number of correct answers
  total_questions integer not null,
  answers jsonb not null, -- User's answers {question_id: selected_option}
  completed_at timestamptz not null default now()
);

create index if not exists quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id, completed_at desc);
create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id, completed_at desc);

-- Enable RLS
alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;

-- RLS policies for quizzes
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Users can select own quizzes'
  ) then
    create policy "Users can select own quizzes"
      on public.quizzes
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Users can insert own quizzes'
  ) then
    create policy "Users can insert own quizzes"
      on public.quizzes
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Users can update own quizzes'
  ) then
    create policy "Users can update own quizzes"
      on public.quizzes
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quizzes' and policyname = 'Users can delete own quizzes'
  ) then
    create policy "Users can delete own quizzes"
      on public.quizzes
      for delete
      using (auth.uid() = user_id);
  end if;
end $$;

-- RLS policies for quiz_attempts
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users can select own quiz attempts'
  ) then
    create policy "Users can select own quiz attempts"
      on public.quiz_attempts
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users can insert own quiz attempts'
  ) then
    create policy "Users can insert own quiz attempts"
      on public.quiz_attempts
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

