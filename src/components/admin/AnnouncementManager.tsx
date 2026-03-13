'use client'

import { AeroButton } from '@/components/ui/AeroButton'

interface Announcement {
  id: string
  title: string
  content: string
  turn?: number
  created_at: string
}

interface AnnouncementManagerProps {
  announcements: Announcement[]
  onDelete: (id: string) => void
  deleting: string | null
}

export function AnnouncementManager({ announcements, onDelete, deleting }: AnnouncementManagerProps) {
  if (announcements.length === 0) {
    return <p className="text-text-muted text-sm">No announcements yet.</p>
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a.id} className="aero-panel p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm">{a.title}</h3>
              {a.turn !== undefined && <span className="badge badge-info">Turn {a.turn}</span>}
            </div>
            <p className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-3">{a.content}</p>
            <div className="text-xs text-text-muted mt-1">
              {new Date(a.created_at).toLocaleString()}
            </div>
          </div>
          <AeroButton
            variant="danger"
            className="text-xs !py-1 !px-2 shrink-0"
            onClick={() => onDelete(a.id)}
            loading={deleting === a.id}
          >
            Delete
          </AeroButton>
        </div>
      ))}
    </div>
  )
}
