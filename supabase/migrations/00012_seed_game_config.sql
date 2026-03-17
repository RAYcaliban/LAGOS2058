-- 00012_seed_game_config.sql
-- Seed initial game configuration values

insert into public.game_config (key, value, description) values
  ('current_turn', '1', 'The current active turn number'),
  ('game_name', '"LAGOS 2058"', 'Display name of the game'),
  ('max_turns', '12', 'Total number of turns in the campaign'),
  ('pc_income_base', '7', 'Base Political Capital income per turn (1-member party)'),
  ('pc_income_per_extra_member', '2', 'Bonus PC per additional party member beyond the first'),
  ('pc_income_cap', '21', 'Maximum PC income per turn regardless of party size'),
  ('pc_hoarding_cap', '68', 'Maximum Political Capital a party can hoard'),
  ('submission_open', 'false', 'Whether action submissions are currently accepted');
