import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WikiArticleContent } from '@/components/wiki/WikiArticleContent'
import { WikiTableOfContents } from '@/components/wiki/WikiTableOfContents'
import { WikiInfobox } from '@/components/wiki/WikiInfobox'
import { WikiCategoryFooter } from '@/components/wiki/WikiCategoryFooter'
import { WikiApprovalBanner } from '@/components/wiki/WikiApprovalBanner'
import { WikiBreadcrumbs } from '@/components/wiki/WikiBreadcrumbs'
import type { WikiPageType, InfoboxData } from '@/lib/types/wiki'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ revision?: string }>
}

export default async function WikiArticlePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { revision: revisionId } = await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*, parties(name, full_name, color, leader_name, ethnicity, religion_display), profiles!wiki_pages_last_edited_by_fkey(id, display_name, avatar_url)')
    .eq('slug', slug)
    .single()

  if (error || !data) notFound()

  const party = data.parties as { name: string; full_name: string; color: string | null; leader_name: string | null; ethnicity: string | null; religion_display: string | null } | null
  const editor = data.profiles as { id: string; display_name: string; avatar_url: string | null } | null
  const pageType = data.page_type as WikiPageType
  const approved = data.approved ?? false
  const approvedRevisionId = data.approved_revision_id ?? null

  // If viewing a specific revision, fetch that content
  let displayTitle = data.title as string
  let displayContent = data.content as string
  let viewingRevision = false

  if (revisionId) {
    const { data: rev } = await supabase
      .from('wiki_revisions')
      .select('title, content, revision_number, created_at')
      .eq('id', revisionId)
      .single()

    if (rev) {
      displayTitle = rev.title
      displayContent = rev.content
      viewingRevision = true
    }
  }

  // Build infobox data — use stored data or fallback for party pages
  // select('*') returns infobox_data only after migration — safe either way
  let infoboxData: InfoboxData | null = ('infobox_data' in data) ? (data.infobox_data as unknown as InfoboxData) ?? null : null
  if (!infoboxData && pageType === 'party' && party) {
    // Backward-compat: construct InfoboxData from joined party fields
    const fields: { key: string; label: string; value: string }[] = []
    if (party.full_name) fields.push({ key: 'full_name', label: 'Full name', value: party.full_name })
    if (party.leader_name) fields.push({ key: 'leader', label: 'Leader', value: party.leader_name })
    if (party.ethnicity) fields.push({ key: 'ethnicity', label: 'Ethnicity', value: party.ethnicity })
    if (party.religion_display) fields.push({ key: 'religion', label: 'Religion', value: party.religion_display })
    if (fields.length > 0) {
      infoboxData = {
        templateType: 'party',
        sections: [{ heading: 'General', fields }],
      }
    }
  }

  return (
    <div>
      {/* Revision notice */}
      {viewingRevision && (
        <div className="wiki-approval-warning" style={{ background: '#e3f2fd', borderColor: '#1976d2' }}>
          You are viewing an older revision of this article.{' '}
          <Link href={`/wiki/${slug}`}>View current version</Link>
        </div>
      )}

      <WikiBreadcrumbs pageType={pageType} title={displayTitle} slug={slug} />

      {/* Approval banner */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <WikiApprovalBanner
          approved={approved}
          approvedRevisionId={approvedRevisionId}
          slug={slug}
        />
      </div>

      <h1 className="wiki-article-title">{displayTitle}</h1>

      {/* Infobox for pages with structured data */}
      <WikiInfobox
        title={displayTitle}
        partyColor={party?.color}
        data={infoboxData}
      />

      {/* Table of contents */}
      <WikiTableOfContents content={displayContent} />

      {/* Article content */}
      <WikiArticleContent content={displayContent} />

      <div style={{ clear: 'both' }} />

      {/* Category footer */}
      <WikiCategoryFooter pageType={pageType} />

      {/* Meta footer */}
      <div className="wiki-meta-footer" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>
          {editor && (
            <>Last edited by <strong>{editor.display_name}</strong> on {new Date(data.updated_at).toLocaleDateString()}</>
          )}
          {!editor && <>Created on {new Date(data.created_at).toLocaleDateString()}</>}
        </span>
        <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href={`/wiki/${slug}/edit`}>Edit this page</Link>
          {['party', 'character'].includes(pageType) && (
            <span style={{ fontSize: '0.65rem', color: '#999' }}>(party members &amp; GMs)</span>
          )}
          <Link href={`/wiki/${slug}/history`}>View history</Link>
        </span>
      </div>
    </div>
  )
}
