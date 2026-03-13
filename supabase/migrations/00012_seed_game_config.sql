-- 00012_seed_game_config.sql
-- Seed initial game configuration values

insert into public.game_config (key, value, description) values
  ('current_turn', '1', 'The current active turn number'),
  ('game_name', '"LAGOS 2058"', 'Display name of the game'),
  ('max_turns', '12', 'Total number of turns in the campaign'),
  ('pc_income_per_turn', '7', 'Political Capital income each party receives per turn'),
  ('pc_hoarding_cap', '18', 'Maximum Political Capital a party can hoard'),
  ('submission_open', 'false', 'Whether action submissions are currently accepted');
