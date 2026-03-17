-- Add discord_handle column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_handle text;
