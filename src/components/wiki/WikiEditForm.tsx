'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WikiArticleContent } from './WikiArticleContent'

interface WikiEditFormProps {
  slug: string
  initialTitle: string
  initialContent: string
}

export function WikiEditForm({ slug, initialTitle, initialContent }: WikiEditFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [editSummary, setEditSummary] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/wiki/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, editSummary: editSummary.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }
      router.push(`/wiki/${slug}`)
      router.refresh()
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="wiki-article-title">Editing: {initialTitle}</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4 }}>
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="wiki-edit-input"
        />
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
        />
      </div>

      {showPreview && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4, borderBottom: '1px solid #a2a9b1', paddingBottom: 4 }}>
            Preview
          </div>
          <WikiArticleContent content={content} />
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 4 }}>
          Edit summary <span style={{ fontWeight: 'normal', color: '#666' }}>(briefly describe your changes)</span>
        </label>
        <input
          type="text"
          value={editSummary}
          onChange={(e) => setEditSummary(e.target.value)}
          placeholder="e.g. Updated campaign history for Turn 3"
          className="wiki-edit-input"
          maxLength={200}
        />
      </div>

      {error && (
        <div style={{ color: '#d32f2f', fontSize: '0.85rem', marginBottom: 8 }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim() || !content.trim()}
          className="wiki-edit-btn wiki-edit-btn-primary"
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.push(`/wiki/${slug}`)}
          className="wiki-edit-btn"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
