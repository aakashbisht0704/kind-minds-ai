-- Table to store newsletter / waitlist signups from landing page
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text,
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);

alter table public.newsletter_subscribers enable row level security;

-- Allow anonymous and authenticated clients to insert their own email.
-- Reads will typically be done via service role.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'newsletter_subscribers'
      and policyname = 'Anyone can join newsletter'
  ) then
    create policy "Anyone can join newsletter"
      on public.newsletter_subscribers
      for insert
      with check (true);
  end if;
end $$;


