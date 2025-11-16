-- Add MBTI personality type to profiles table
-- MBTI types are 4-letter codes: INTJ, ENFP, etc. (16 possible types)

alter table public.profiles
add column if not exists mbti_type text check (
  mbti_type is null or 
  mbti_type in (
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  )
);

create index if not exists profiles_mbti_type_idx on public.profiles (mbti_type);

-- Update personality_results to also store the latest MBTI type
-- (already has personality_type text field, which will now store MBTI codes)

