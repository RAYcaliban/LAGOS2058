-- 00024_wiki_page_types.sql
-- Expand wiki page_type to include organization, location, and institution

ALTER TABLE public.wiki_pages DROP CONSTRAINT IF EXISTS wiki_pages_page_type_check;
ALTER TABLE public.wiki_pages ADD CONSTRAINT wiki_pages_page_type_check
  CHECK (page_type IN ('party', 'character', 'event', 'lore', 'general', 'organization', 'location', 'institution'));
