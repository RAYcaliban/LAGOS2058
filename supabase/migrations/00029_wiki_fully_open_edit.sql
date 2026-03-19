-- 00029_wiki_fully_open_edit.sql
-- Allow any authenticated user to edit ANY wiki page, including party/character pages.

-- wiki_pages UPDATE — any authenticated user
DROP POLICY IF EXISTS "wiki_pages_update" ON public.wiki_pages;
CREATE POLICY "wiki_pages_update"
  ON public.wiki_pages FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- wiki_pages INSERT — any authenticated user
DROP POLICY IF EXISTS "wiki_pages_insert" ON public.wiki_pages;
CREATE POLICY "wiki_pages_insert"
  ON public.wiki_pages FOR INSERT TO authenticated
  WITH CHECK (true);

-- wiki_revisions INSERT — any authenticated user
DROP POLICY IF EXISTS "wiki_revisions_insert" ON public.wiki_revisions;
CREATE POLICY "wiki_revisions_insert"
  ON public.wiki_revisions FOR INSERT TO authenticated
  WITH CHECK (true);
