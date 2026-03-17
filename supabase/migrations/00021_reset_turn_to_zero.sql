-- 00021_reset_turn_to_zero.sql
-- Reset current turn to 0 (pre-game state)

update public.game_config
  set value = '0'
  where key = 'current_turn';
