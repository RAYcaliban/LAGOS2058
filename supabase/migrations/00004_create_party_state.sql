-- 00004_create_party_state.sql
-- Per-turn party state — THE critical table
-- Tracks political capital, cohesion, exposure, momentum, vote share, seats, etc.

create table public.party_state (
  id uuid primary key default gen_random_uuid(),
  party_id uuid not null references public.parties(id),
  turn int not null,
  pc int not null default 7,
  cohesion float not null default 80.0,
  exposure float not null default 0.0,
  momentum float not null default 0.0,
  vote_share float not null default 0.0,
  seats int not null default 0,
  awareness float not null default 0.0,
  epo_scores jsonb not null default '{}',
  poll_results jsonb,
  scandal_history jsonb,
  action_history jsonb,
  created_at timestamptz not null default now(),
  unique (party_id, turn)
);

alter table public.party_state enable row level security;
