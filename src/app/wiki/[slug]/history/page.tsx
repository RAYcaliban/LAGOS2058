import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import { WikiHistoryCompare } from '@/components/wiki/WikiHistoryCompare'
import type { WikiPageType } from '@/lib/types/wiki'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function WikiHistoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('wiki_pages')
    .select('id, title, page_type, approved_revision_id')
    .eq('slug', slug)
    .single()

  if (!page) notFound()

  const { data: revisions } = await supabase
    .from('wiki_revisions')
    .select('id, title, revision_number, created_at, edited_by, edit_summary, profiles!wiki_revisions_edited_by_fkey(display_name)')
    .eq('wiki_page_id', page.id)
    .order('revision_number', { ascending: false })

  const mapped = (revisions ?? []).map((rev: Record<string, unknown>) => {
    const editor = rev.profiles as { display_name: string } | null
    return {
      id: rev.id as string,
      title: rev.title as string,
      revisionNumber: rev.revision_number as number,
      createdAt: rev.created_at as string,
      editedBy: editor?.display_name ?? null,
      editSummary: (rev.edit_summary as string) ?? null,
      isApproved: rev.id === page.approved_revision_id,
    }
  })

  return (
    <div>
      <WikiBreadcrumbs
        pageType={page.page_type as WikiPageType}
        title={page.title}
        slug={slug}
        suffix="History"
      />

      <h1 className="wiki-article-title">
        Revision history of &ldquo;{page.title}&rdquo;
      </h1>

      <WikiHistoryCompare slug={slug} revisions={mapped} />
    </div>
  )
}
