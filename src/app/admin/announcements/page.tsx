'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AnnouncementForm } from '@/components/admin/AnnouncementForm'
import { AnnouncementManager } from '@/components/admin/AnnouncementManager'

interface Announcement {
  id: string
  title: string
  content: string
  turn?: number
  created_at: string
}

interface AnnouncementsData {
  announcements: Announcement[]
  turn: number
}

export default function AdminAnnouncementsPage() {
  const { data, refetch } = useAdminFetch<AnnouncementsData>('/api/admin/announcements')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handlePublish(title: string, content: string, turn: number) {
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, turn }),
    })
    refetch()
  }

  async function handleDelete(announcementId: string) {
    setDeleting(announcementId)
    await fetch('/api/admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId }),
    })
    setDeleting(null)
    refetch()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Announcements</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>

      <AeroPanel>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
          Compose
        </h2>
        <AnnouncementForm currentTurn={data?.turn ?? 1} onPublish={handlePublish} />
      </AeroPanel>

      <AeroPanel>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-3">
          Published
        </h2>
        <AnnouncementManager
          announcements={data?.announcements ?? []}
          onDelete={handleDelete}
          deleting={deleting}
        />
      </AeroPanel>
    </div>
  )
}
