-- Add structured infobox data to wiki pages and revisions
ALTER TABLE public.wiki_pages ADD COLUMN IF NOT EXISTS infobox_data jsonb DEFAULT NULL;
ALTER TABLE public.wiki_revisions ADD COLUMN IF NOT EXISTS infobox_data jsonb DEFAULT NULL;
