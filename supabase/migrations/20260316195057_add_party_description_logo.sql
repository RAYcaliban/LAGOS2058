ALTER TABLE parties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE parties ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create party-logos storage bucket with public read access
INSERT INTO storage.buckets (id, name, public)
VALUES ('party-logos', 'party-logos', true)
ON CONFLICT (id) DO NOTHING;
