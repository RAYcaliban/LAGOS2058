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

interface WikiBreadcrumbsProps {
  pageType: WikiPageType
  title: string
  slug: string
  suffix?: string
}

export function WikiBreadcrumbs({ pageType, title, slug, suffix }: WikiBreadcrumbsProps) {
  return (
    <nav style={{ fontSize: '0.8rem', color: '#666', marginBottom: 12 }}>
      <Link href="/wiki">Wiki</Link>
      {' > '}
      <Link href={`/wiki?type=${pageType}`}>{CATEGORY_LABELS[pageType]}</Link>
      {' > '}
      {suffix ? (
        <>
          <Link href={`/wiki/${slug}`}>{title}</Link>
          {' > '}
          <span>{suffix}</span>
        </>
      ) : (
        <span>{title}</span>
      )}
    </nav>
  )
}
