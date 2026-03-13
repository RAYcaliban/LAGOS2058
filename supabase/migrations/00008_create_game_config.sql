-- 00008_create_game_config.sql
-- Key-value configuration store for game settings

create table public.game_config (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null,
  description text
);

alter table public.game_config enable row level security;
