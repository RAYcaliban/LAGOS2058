-- 00019_religion_display.sql
-- Store the player-facing religion label separately from the engine value.
-- "Shia" maps to engine "Mainstream Sunni", "Jewish" maps to engine "Secular".

alter table public.profiles add column if not exists religion_display text;
alter table public.parties  add column if not exists religion_display text;
