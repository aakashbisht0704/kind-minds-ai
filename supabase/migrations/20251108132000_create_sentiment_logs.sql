create table if not exists public.sentiment_logs (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sentiment text not null,
  score double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists sentiment_logs_chat_id_idx on public.sentiment_logs (chat_id, created_at desc);


