import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { WikiPageList } from '@/components/wiki/WikiPageList'

const TYPE_LABELS: Record<string, string> = {
  party: 'Political Parties',
  character: 'People',
  organization: 'Organizations',
  location: 'Locations',
  institution: 'Institutions',
  event: 'Events',
  lore: 'History',
  general: 'General',
}

const ALL_TYPES = ['party', 'character', 'organization', 'location', 'institution', 'event', 'lore', 'general']
const PAGE_SIZE = 50

function sanitizeSearch(input: string): string {
  return input.slice(0, 200).replace(/%/g, '\\%').replace(/_/g, '\\_')
}

interface Props {
  searchParams: Promise<{ type?: string; search?: string; page?: string }>
}

export default async function WikiPage({ searchParams }: Props) {
  const { type, search: rawSearch, page: pageStr } = await searchParams
  const search = rawSearch ? sanitizeSearch(rawSearch) : null
  const currentPage = Math.max(1, parseInt(pageStr ?? '1', 10))
  const supabase = await createClient()

  // Lightweight count query — only fetch page_type column (no joins)
  const { data: countRows } = await supabase
    .from('wiki_pages')
    .select('page_type')

  const typeCounts: Record<string, number> = {}
  for (const t of ALL_TYPES) typeCounts[t] = 0
  for (const row of countRows ?? []) {
    typeCounts[row.page_type] = (typeCounts[row.page_type] || 0) + 1
  }
  const totalAll = (countRows ?? []).length

  // Recent changes — separate lightweight query with limit
  const { data: recentData } = await supabase
    .from('wiki_pages')
    .select('slug, title, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5)

  const recentChanges = (recentData ?? []).map((row) => ({
    slug: row.slug,
    title: row.title,
    updatedAt: row.updated_at,
  }))

  const isFiltered = !!type || !!rawSearch

  // Paginated + filtered query
  const offset = (currentPage - 1) * PAGE_SIZE
  let filteredQuery = supabase
    .from('wiki_pages')
    .select('id, slug, title, page_type, party_id, updated_at, parties(name, color)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (type) {
    filteredQuery = filteredQuery.eq('page_type', type)
  }
  if (search) {
    filteredQuery = filteredQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data: filteredData, count } = await filteredQuery

  const filtered = (filteredData ?? []).map((row) => {
    const party = row.parties as { name: string; color: string | null } | null
    return {
      slug: row.slug,
      title: row.title,
      pageType: row.page_type,
      partyId: row.party_id,
      partyName: party?.name ?? null,
      partyColor: party?.color ?? null,
      updatedAt: row.updated_at,
    }
  })

  const totalFiltered = count ?? filtered.length
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (rawSearch) params.set('search', rawSearch)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return `/wiki${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      {!isFiltered && (
        <>
          <h1 className="wiki-article-title">
            Lagos 2058 Encyclopaedia &mdash; Main Page
          </h1>

          <p style={{ marginBottom: 16 }}>
            Welcome to the <strong>Lagos 2058 Encyclopaedia</strong>, the collaborative knowledge base for the
            Fifth Republic of Nigeria. This wiki documents the parties, characters, events, and lore of the
            LAGOS 2058 political campaign simulation.
            {' '}<Link href="/wiki/create" style={{ fontWeight: 'bold' }}>Create a new article &rarr;</Link>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {ALL_TYPES.map((t) => (
              <Link key={t} href={`/wiki?type=${t}`} style={{ textDecoration: 'none' }}>
                <div className="wiki-portal-box">
                  <div className="wiki-portal-box-header">{TYPE_LABELS[t]}</div>
                  <div className="wiki-portal-box-body">
                    {typeCounts[t]} article{typeCounts[t] !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {recentChanges.length > 0 && (
            <div className="wiki-portal-box" style={{ marginBottom: 24 }}>
              <div className="wiki-portal-box-header">Recent Changes</div>
              <div className="wiki-portal-box-body">
                <ul style={{ margin: 0, paddingLeft: '1.5em' }}>
                  {recentChanges.map((p) => (
                    <li key={p.slug} style={{ marginBottom: 2 }}>
                      <Link href={`/wiki/${p.slug}`}>{p.title}</Link>
                      <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: 6 }}>
                        ({new Date(p.updatedAt).toLocaleDateString()})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {isFiltered && (
        <h1 className="wiki-article-title">
          {rawSearch ? `Search results for "${rawSearch}"` : TYPE_LABELS[type!] ?? 'Articles'}
        </h1>
      )}

      <div className="wiki-tabs">
        <Link href="/wiki" className={`wiki-tab ${!type && !rawSearch ? 'wiki-tab-active' : ''}`}>
          All ({totalAll})
        </Link>
        {ALL_TYPES.map((t) => (
          <Link
            key={t}
            href={`/wiki?type=${t}`}
            className={`wiki-tab ${type === t ? 'wiki-tab-active' : ''}`}
          >
            {TYPE_LABELS[t]} ({typeCounts[t]})
          </Link>
        ))}
      </div>

      <WikiPageList pages={filtered} />

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24, fontSize: '0.85rem' }}>
          {currentPage > 1 && (
            <Link href={pageUrl(currentPage - 1)}>&larr; Previous</Link>
          )}
          <span style={{ color: '#666' }}>
            Page {currentPage} of {totalPages} ({totalFiltered} article{totalFiltered !== 1 ? 's' : ''})
          </span>
          {currentPage < totalPages && (
            <Link href={pageUrl(currentPage + 1)}>Next &rarr;</Link>
          )}
        </div>
      )}
    </div>
  )
}
