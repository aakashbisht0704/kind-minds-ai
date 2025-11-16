create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  date timestamptz not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id, date desc);


