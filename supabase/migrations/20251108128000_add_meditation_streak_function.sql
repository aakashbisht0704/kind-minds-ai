-- Add metadata to support accurate meditation streak tracking
alter table public.profiles
  add column if not exists last_meditation_date date;

-- Function to atomically increment meditation minutes and update streak
create or replace function public.increment_meditation_stats(
  p_user_id uuid,
  p_seconds integer,
  p_completed_at timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_today date;
  v_session_minutes integer;
  v_new_streak integer;
begin
  -- Ensure caller is acting on their own profile
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not allowed';
  end if;

  select meditation_minutes, streak_days, last_meditation_date
  into v_profile
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return;
  end if;

  v_session_minutes := ceil(greatest(p_seconds, 0) / 60.0);
  if v_session_minutes <= 0 then
    return;
  end if;

  v_today := (p_completed_at at time zone 'utc')::date;

  if v_profile.last_meditation_date is null then
    v_new_streak := 1;
  elsif v_profile.last_meditation_date = v_today then
    v_new_streak := greatest(v_profile.streak_days, 1);
  elsif v_profile.last_meditation_date = v_today - 1 then
    v_new_streak := coalesce(v_profile.streak_days, 0) + 1;
  else
    v_new_streak := 1;
  end if;

  update public.profiles
  set meditation_minutes = coalesce(meditation_minutes, 0) + v_session_minutes,
      streak_days = v_new_streak,
      last_meditation_date = v_today
  where id = p_user_id;
end;
$$;


