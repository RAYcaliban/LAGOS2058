-- 00026_wiki_open_edit.sql
-- Allow any authenticated user to edit non-party/character wiki pages.
-- Party and character pages remain restricted to party members + GMs.

-- Update wiki_pages UPDATE policy
DROP POLICY IF EXISTS "wiki_pages_update" ON public.wiki_pages;
CREATE POLICY "wiki_pages_update"
  ON public.wiki_pages FOR UPDATE TO authenticated
  USING (
    (party_id = public.my_party_id() AND page_type IN ('party', 'character'))
    OR public.is_gm_or_admin()
    OR page_type NOT IN ('party', 'character')
  )
  WITH CHECK (
    (party_id = public.my_party_id() AND page_type IN ('party', 'character'))
    OR public.is_gm_or_admin()
    OR page_type NOT IN ('party', 'character')
  );

-- Update wiki_pages INSERT policy
DROP POLICY IF EXISTS "wiki_pages_insert" ON public.wiki_pages;
CREATE POLICY "wiki_pages_insert"
  ON public.wiki_pages FOR INSERT TO authenticated
  WITH CHECK (
    (party_id = public.my_party_id() AND page_type IN ('party', 'character'))
    OR public.is_gm_or_admin()
    OR page_type NOT IN ('party', 'character')
  );

-- Update wiki_revisions INSERT policy to match
DROP POLICY IF EXISTS "wiki_revisions_insert" ON public.wiki_revisions;
CREATE POLICY "wiki_revisions_insert"
  ON public.wiki_revisions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wiki_pages wp
      WHERE wp.id = wiki_page_id
      AND (
        (wp.party_id = public.my_party_id() AND wp.page_type IN ('party', 'character'))
        OR public.is_gm_or_admin()
        OR wp.page_type NOT IN ('party', 'character')
      )
    )
  );
