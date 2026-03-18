'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'

interface WikiPageRow {
  id: string
  slug: string
  title: string
  page_type: string
  party_id: string | null
  approved: boolean
  updated_at: string
}

export default function AdminWikiPage() {
  const { data, refetch } = useAdminFetch<{ pages: WikiPageRow[] }>('/api/admin/wiki')
  const [loading, setLoading] = useState<string | null>(null)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<string | null>(null)

  const pages = data?.pages ?? []
  const pendingCount = pages.filter((p) => !p.approved).length

  async function toggleApproval(id: string, approved: boolean) {
    setLoading(id)
    await fetch('/api/admin/wiki', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    setLoading(null)
    refetch()
  }

  async function handleBackfill() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/admin/wiki/backfill', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setBackfillResult(`Error: ${data.error}`)
      } else {
        const { parties, characters } = data.created
        setBackfillResult(`Created ${parties} party page${parties !== 1 ? 's' : ''} and ${characters} character page${characters !== 1 ? 's' : ''}.`)
        refetch()
      }
    } catch {
      setBackfillResult('Failed to backfill')
    }
    setBackfilling(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Wiki Management</h1>
        <div className="glow-line max-w-xs mb-2" />
        <div className="flex items-center gap-4 flex-wrap">
          {pendingCount > 0 && (
            <p className="text-sm text-warning">
              {pendingCount} article{pendingCount !== 1 ? 's' : ''} pending approval
            </p>
          )}
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            className="text-xs px-3 py-1.5 rounded border border-aero-500/30 text-aero-400 hover:bg-aero-500/10 transition-colors disabled:opacity-50"
          >
            {backfilling ? 'Backfilling...' : 'Backfill Missing Pages'}
          </button>
          {backfillResult && (
            <span className="text-xs text-text-muted">{backfillResult}</span>
          )}
        </div>
      </div>

      <AeroPanel>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-aero-500/10 text-left">
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Status</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Title</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Type</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Slug</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Updated</th>
                <th className="py-2 px-3 text-xs uppercase tracking-wider text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-b border-aero-900/30 hover:bg-bg-tertiary/30">
                  <td className="py-2 px-3">
                    <span
                      className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        page.approved
                          ? 'bg-success/10 text-success border border-success/20'
                          : 'bg-warning/10 text-warning border border-warning/20'
                      }`}
                    >
                      {page.approved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-text-primary font-medium">{page.title}</td>
                  <td className="py-2 px-3 text-text-muted capitalize">{page.page_type}</td>
                  <td className="py-2 px-3 text-text-muted font-mono text-xs">{page.slug}</td>
                  <td className="py-2 px-3 text-text-muted">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/wiki/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-aero-400 hover:underline"
                      >
                        View
                      </a>
                      <a
                        href={`/wiki/${page.slug}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-aero-400 hover:underline"
                      >
                        Edit
                      </a>
                      <button
                        onClick={() => toggleApproval(page.id, !page.approved)}
                        disabled={loading === page.id}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          page.approved
                            ? 'border-danger/30 text-danger hover:bg-danger/10'
                            : 'border-success/30 text-success hover:bg-success/10'
                        } disabled:opacity-50`}
                      >
                        {loading === page.id ? '...' : page.approved ? 'Revoke' : 'Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    No wiki articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AeroPanel>
    </div>
  )
}
