-- 00005_create_action_submissions.sql
-- Player action submissions per turn

create table public.action_submissions (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id),
  turn int not null,
  action_type text not null,
  params jsonb not null default '{}',
  target_lgas jsonb,
  target_azs jsonb,
  language text not null default 'english',
  pc_cost int not null default 0,
  quality_score float,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'processed', 'rejected')),
  description text not null default '',
  gm_notes text,
  created_at timestamptz not null default now()
);

alter table public.action_submissions enable row level security;
