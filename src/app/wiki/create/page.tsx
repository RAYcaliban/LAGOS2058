'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { WikiArticleContent } from '@/components/wiki/WikiArticleContent'

const PAGE_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'party', label: 'Political Party' },
  { value: 'character', label: 'Person' },
  { value: 'organization', label: 'Organization' },
  { value: 'location', label: 'Location' },
  { value: 'institution', label: 'Institution' },
  { value: 'event', label: 'Event' },
  { value: 'lore', label: 'History' },
]

export default function WikiCreatePage() {
  const { loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pageType, setPageType] = useState('general')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || undefined,
          pageType,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create article')
        return
      }
      router.push(`/wiki/${data.slug}`)
    } catch {
      setError('Failed to create article')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return <p style={{ color: '#666' }}>Loading...</p>
  }

  return (
    <div>
      <h1 className="wiki-article-title">Create New Article</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4 }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title"
          className="wiki-edit-input"
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4 }}>
          Type
        </label>
        <select
          value={pageType}
          onChange={(e) => setPageType(e.target.value)}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '0.85rem',
            padding: '4px 8px',
            border: '1px solid #a2a9b1',
            background: '#fff',
            color: '#202122',
          }}
        >
          {PAGE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Content (Markdown)</label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="wiki-edit-btn"
            style={{ fontSize: '0.75rem', padding: '2px 10px' }}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="wiki-edit-textarea"
          placeholder={`# ${title || 'Article Title'}\n\nWrite your article content here using Markdown...`}
        />
      </div>

      {showPreview && content.trim() && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4, borderBottom: '1px solid #a2a9b1', paddingBottom: 4 }}>
            Preview
          </div>
          <WikiArticleContent content={content} />
        </div>
      )}

      {error && (
        <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="wiki-edit-btn wiki-edit-btn-primary"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Creating...' : 'Create Article'}
        </button>
        <button
          onClick={() => router.push('/wiki')}
          className="wiki-edit-btn"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
