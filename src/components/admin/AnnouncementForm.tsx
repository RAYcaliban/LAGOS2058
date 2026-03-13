'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroInput } from '@/components/ui/AeroInput'

interface AnnouncementFormProps {
  currentTurn: number
  onPublish: (title: string, content: string, turn: number) => Promise<void>
}

export function AnnouncementForm({ currentTurn, onPublish }: AnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [turn, setTurn] = useState(currentTurn)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setLoading(true)
    await onPublish(title, content, turn)
    setTitle('')
    setContent('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <AeroInput
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Announcement title..."
      />
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
          Content (Markdown)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="aero-input w-full resize-y"
          placeholder="Write your announcement..."
        />
      </div>
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">Turn</label>
          <input
            type="number"
            value={turn}
            onChange={(e) => setTurn(parseInt(e.target.value) || 0)}
            className="aero-input w-20"
            min={0}
          />
        </div>
        <AeroButton type="submit" loading={loading} disabled={!title.trim() || !content.trim()}>
          Publish
        </AeroButton>
      </div>
    </form>
  )
}
