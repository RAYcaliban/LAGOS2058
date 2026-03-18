import Link from 'next/link'

interface PageRow {
  slug: string
  title: string
  pageType: string
  partyName: string | null
  partyColor: string | null
  updatedAt: string
}

interface WikiPageListProps {
  pages: PageRow[]
}

export function WikiPageList({ pages }: WikiPageListProps) {
  if (pages.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No articles found.</p>
  }

  return (
    <table className="wiki-index-table">
      <thead>
        <tr>
          <th>Article</th>
          <th>Type</th>
          <th>Party</th>
          <th>Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((page) => (
          <tr key={page.slug}>
            <td>
              <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
            </td>
            <td style={{ textTransform: 'capitalize' }}>{page.pageType}</td>
            <td>
              {page.partyName ? (
                <span>
                  {page.partyColor && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        backgroundColor: page.partyColor,
                        marginRight: 4,
                        verticalAlign: 'middle',
                      }}
                    />
                  )}
                  {page.partyName}
                </span>
              ) : (
                <span style={{ color: '#999' }}>&mdash;</span>
              )}
            </td>
            <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
