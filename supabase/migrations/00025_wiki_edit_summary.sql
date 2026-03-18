-- 00025_wiki_edit_summary.sql
-- Add edit summary field to wiki revisions

ALTER TABLE public.wiki_revisions
  ADD COLUMN IF NOT EXISTS edit_summary text DEFAULT NULL;

COMMENT ON COLUMN public.wiki_revisions.edit_summary IS 'Brief description of the change made in this revision.';
