create extension if not exists "pgcrypto";

create table if not exists public.personality_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null,
  summary text,
  personality_type text,
  score integer,
  created_at timestamptz not null default now()
);

create index if not exists personality_results_user_id_idx on public.personality_results (user_id, created_at desc);

create table if not exists public.thought_labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  thought text not null,
  label text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists thought_labels_user_id_idx on public.thought_labels (user_id, created_at desc);

create table if not exists public.reframes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_thought text not null,
  reframed_thought text not null,
  created_at timestamptz not null default now()
);

create index if not exists reframes_user_id_idx on public.reframes (user_id, created_at desc);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  source_file_path text,
  cards jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists flashcards_user_id_idx on public.flashcards (user_id, created_at desc);

create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type text not null default 'text',
  source_file_path text,
  prompt text not null,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists problems_user_id_idx on public.problems (user_id, created_at desc);

-- Storage bucket for tool uploads
insert into storage.buckets (id, name, public)
values ('tool-uploads', 'Tool uploads', false)
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 52428800
where id = 'tool-uploads';

-- Avatar bucket for profile images
insert into storage.buckets (id, name, public)
values ('avatars', 'User avatars', false)
on conflict (id) do nothing;