import Link from 'next/link'
import { AeroPanel } from '@/components/ui/AeroPanel'

interface WikiPageRow {
  slug: string
  title: string
  pageType: string
  updatedAt: string
}

interface PartyWikiPagesProps {
  pages: WikiPageRow[]
  partyName: string
}

export function PartyWikiPages({ pages, partyName }: PartyWikiPagesProps) {
  return (
    <AeroPanel>
      <h2 className="naira-header mb-1">Party Wiki Pages</h2>
      <div className="glow-line max-w-xs mb-3" />

      {pages.length === 0 ? (
        <div>
          <p className="text-sm text-text-secondary mb-3">
            No wiki pages for {partyName} yet.
          </p>
          <Link href="/wiki/create" className="text-sm text-aero-400 hover:underline">
            Create your first article &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {pages.map((page) => (
            <div key={page.slug} className="flex items-center justify-between py-1 border-b border-aero-500/10 last:border-0">
              <div className="flex items-center gap-2 min-w-0">
                <Link href={`/wiki/${page.slug}`} className="text-sm text-aero-400 hover:underline truncate">
                  {page.title}
                </Link>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-aero-500/10 text-aero-400/70 uppercase tracking-wider shrink-0">
                  {page.pageType}
                </span>
              </div>
              <Link href={`/wiki/${page.slug}/edit`} className="text-xs text-text-muted hover:text-aero-400 shrink-0 ml-2">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-aero-500/10">
        <Link href="/wiki" className="text-xs text-text-muted hover:text-aero-400">
          Browse all wiki articles &rarr;
        </Link>
      </div>
    </AeroPanel>
  )
}
