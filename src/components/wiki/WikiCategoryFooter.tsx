import Link from 'next/link'
import type { WikiPageType } from '@/lib/types/wiki'

const CATEGORY_LABELS: Record<WikiPageType, string> = {
  party: 'Political Parties',
  character: 'People',
  organization: 'Organizations',
  location: 'Locations',
  institution: 'Institutions',
  event: 'Events',
  lore: 'History',
  general: 'General',
}

interface WikiCategoryFooterProps {
  pageType: WikiPageType
}

export function WikiCategoryFooter({ pageType }: WikiCategoryFooterProps) {
  return (
    <div className="wiki-category-footer">
      <strong>Categories:</strong>{' '}
      <Link href={`/wiki?type=${pageType}`}>{CATEGORY_LABELS[pageType]}</Link>
      {' | '}
      <Link href="/wiki">All Articles</Link>
    </div>
  )
}
