-- 00002_create_parties.sql
-- Political parties competing across Nigeria's 774 LGAs

create table public.parties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,        -- short 3-5 char abbreviation e.g. 'APC', 'PDP'
  full_name text not null,
  color text not null,              -- hex color e.g. '#FF0000'
  leader_name text not null,
  ethnicity text,
  religion text,
  created_at timestamptz not null default now()
);

alter table public.parties enable row level security;

-- Now that parties exists, add the FK from profiles
alter table public.profiles
  add constraint profiles_party_id_fkey
  foreign key (party_id) references public.parties(id);
