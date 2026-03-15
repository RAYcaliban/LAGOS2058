-- D1: Wiki GM Approval
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS approved boolean DEFAULT true;
ALTER TABLE wiki_pages ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES profiles(id);

COMMENT ON COLUMN wiki_pages.approved IS 'Whether this article has been approved by a GM. Defaults to true for existing articles.';
COMMENT ON COLUMN wiki_pages.approved_by IS 'The GM who approved this article.';
