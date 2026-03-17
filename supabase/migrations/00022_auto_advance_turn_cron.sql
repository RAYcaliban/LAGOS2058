-- 00022_auto_advance_turn_cron.sql
-- Auto-advance turn every Monday at midnight EST (05:00 UTC)
-- Stops advancing once max_turns is reached

-- Enable pg_cron and pg_net if not already
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Function to advance the turn
create or replace function public.advance_turn() returns void as $$
declare
  current int;
  max int;
begin
  -- Get current turn
  select (value::int) into current
    from public.game_config
    where key = 'current_turn';

  -- Get max turns
  select (value::int) into max
    from public.game_config
    where key = 'max_turns';

  -- Only advance if below max
  if current < max then
    -- Update game_config
    update public.game_config
      set value = (current + 1)::text
      where key = 'current_turn';

    -- Insert new game_state row
    insert into public.game_state (turn, phase, submission_open)
      values (current + 1, 'submission', false)
      on conflict (turn) do nothing;
  end if;
end;
$$ language plpgsql security definer;

-- Schedule: every Monday at 05:00 UTC = midnight EST
select cron.schedule(
  'advance-turn-weekly',
  '0 5 * * 1',
  'select public.advance_turn()'
);
