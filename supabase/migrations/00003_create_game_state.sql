-- 00003_create_game_state.sql
-- Per-turn game state tracking phases, deadlines, and results

create table public.game_state (
  id uuid primary key default gen_random_uuid(),
  turn int not null unique,
  phase text not null default 'submission'
    check (phase in ('submission', 'resolution', 'results')),
  submission_open bool not null default false,
  deadline timestamptz,
  lga_results jsonb,
  national_results jsonb,
  announcements jsonb,
  created_at timestamptz not null default now()
);

alter table public.game_state enable row level security;
