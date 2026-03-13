-- 00001_create_profiles.sql
-- Player/GM/Admin profile table, linked to Supabase Auth

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  party_id uuid,  -- FK added after parties table exists in 00002
  role text not null default 'player' check (role in ('player', 'gm', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
