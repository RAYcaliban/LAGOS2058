-- 00027_wiki_indexes.sql
-- Performance indexes for wiki queries

CREATE INDEX IF NOT EXISTS idx_wiki_pages_updated_at ON public.wiki_pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_page_type ON public.wiki_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_wiki_pages_party_id ON public.wiki_pages(party_id) WHERE party_id IS NOT NULL;
