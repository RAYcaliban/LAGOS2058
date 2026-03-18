'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Revision {
  id: string
  title: string
  revisionNumber: number
  createdAt: string
  editedBy: string | null
  editSummary: string | null
  isApproved: boolean
}

interface WikiHistoryCompareProps {
  slug: string
  revisions: Revision[]
}

export function WikiHistoryCompare({ slug, revisions }: WikiHistoryCompareProps) {
  const [fromId, setFromId] = useState<string | null>(revisions.length >= 2 ? revisions[1].id : null)
  const [toId, setToId] = useState<string | null>(revisions.length >= 1 ? revisions[0].id : null)
  const router = useRouter()

  function handleCompare() {
    if (fromId && toId && fromId !== toId) {
      router.push(`/wiki/${slug}/diff?from=${fromId}&to=${toId}`)
    }
  }

  if (revisions.length === 0) {
    return <p style={{ color: '#666', fontStyle: 'italic' }}>No revision history available.</p>
  }

  return (
    <div>
      {revisions.length >= 2 && (
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleCompare}
            disabled={!fromId || !toId || fromId === toId}
            className="wiki-edit-btn wiki-edit-btn-primary"
            style={{ fontSize: '0.75rem', padding: '4px 12px', opacity: (!fromId || !toId || fromId === toId) ? 0.5 : 1 }}
          >
            Compare selected revisions
          </button>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            Select an older version (left) and a newer version (right) to compare.
          </span>
        </div>
      )}

      <table className="wiki-index-table">
        <thead>
          <tr>
            {revisions.length >= 2 && <th style={{ width: 40 }}>Old</th>}
            {revisions.length >= 2 && <th style={{ width: 40 }}>New</th>}
            <th>Rev #</th>
            <th>Summary</th>
            <th>Edited by</th>
            <th>Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {revisions.map((rev) => (
            <tr key={rev.id}>
              {revisions.length >= 2 && (
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="radio"
                    name="from"
                    checked={fromId === rev.id}
                    onChange={() => setFromId(rev.id)}
                  />
                </td>
              )}
              {revisions.length >= 2 && (
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="radio"
                    name="to"
                    checked={toId === rev.id}
                    onChange={() => setToId(rev.id)}
                  />
                </td>
              )}
              <td style={{ fontFamily: 'monospace' }}>{rev.revisionNumber}</td>
              <td style={{ fontStyle: rev.editSummary ? 'normal' : 'italic', color: rev.editSummary ? '#202122' : '#999', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rev.editSummary ?? 'No summary'}
              </td>
              <td>{rev.editedBy ?? <span style={{ color: '#999' }}>System</span>}</td>
              <td>{new Date(rev.createdAt).toLocaleString()}</td>
              <td>
                {rev.isApproved && <span className="wiki-canon-badge">Canon</span>}
              </td>
              <td>
                <Link href={`/wiki/${slug}?revision=${rev.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
