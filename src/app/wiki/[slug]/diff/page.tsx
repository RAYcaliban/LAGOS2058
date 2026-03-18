'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WikiDiff } from '@/components/wiki/WikiDiff'

interface RevisionData {
  title: string
  content: string
  revisionNumber: number
  edit_summary: string | null
}

export default function WikiDiffPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const fromId = searchParams.get('from')
  const toId = searchParams.get('to')

  const [oldRev, setOldRev] = useState<RevisionData | null>(null)
  const [newRev, setNewRev] = useState<RevisionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fromId || !toId) {
      setError('Both "from" and "to" revision IDs are required.')
      setLoading(false)
      return
    }

    async function load() {
      try {
        const [fromRes, toRes] = await Promise.all([
          fetch(`/api/wiki/${slug}/diff?revisionId=${fromId}`),
          fetch(`/api/wiki/${slug}/diff?revisionId=${toId}`),
        ])

        if (!fromRes.ok || !toRes.ok) {
          setError('Failed to load one or both revisions.')
          setLoading(false)
          return
        }

        const fromData = await fromRes.json()
        const toData = await toRes.json()
        setOldRev(fromData.revision)
        setNewRev(toData.revision)
      } catch {
        setError('Failed to load revisions.')
      }
      setLoading(false)
    }

    load()
  }, [slug, fromId, toId])

  if (loading) {
    return <p style={{ color: '#666' }}>Loading diff...</p>
  }

  if (error) {
    return (
      <div>
        <h1 className="wiki-article-title">Diff Error</h1>
        <p style={{ color: '#d32f2f' }}>{error}</p>
        <p><Link href={`/wiki/${slug}/history`}>&larr; Back to history</Link></p>
      </div>
    )
  }

  if (!oldRev || !newRev) {
    return (
      <div>
        <h1 className="wiki-article-title">Diff Error</h1>
        <p style={{ color: '#d32f2f' }}>Failed to load revision data.</p>
        <p><Link href={`/wiki/${slug}/history`}>&larr; Back to history</Link></p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="wiki-article-title">
        Comparing revisions of &ldquo;{newRev.title}&rdquo;
      </h1>

      <p style={{ marginBottom: 16, fontSize: '0.85rem' }}>
        <Link href={`/wiki/${slug}/history`}>&larr; Back to history</Link>
      </p>

      <WikiDiff
        oldText={oldRev.content}
        newText={newRev.content}
        oldLabel={`Revision ${oldRev.revisionNumber}${oldRev.edit_summary ? ` — ${oldRev.edit_summary}` : ''}`}
        newLabel={`Revision ${newRev.revisionNumber}${newRev.edit_summary ? ` — ${newRev.edit_summary}` : ''}`}
      />
    </div>
  )
}
