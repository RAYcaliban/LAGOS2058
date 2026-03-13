'use client'

import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { GameConfigEditor } from '@/components/admin/GameConfigEditor'

interface ConfigRow {
  id: string
  key: string
  value: unknown
  description: string | null
}

export default function AdminConfigPage() {
  const { data, refetch } = useAdminFetch<{ configs: ConfigRow[] }>('/api/admin/game-config')

  async function handleAdd(key: string, value: unknown, description: string) {
    await fetch('/api/admin/game-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, description }),
    })
    refetch()
  }

  async function handleUpdate(id: string, value: unknown, description: string) {
    await fetch('/api/admin/game-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, value, description }),
    })
    refetch()
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/game-config', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    refetch()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Game Config</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <GameConfigEditor
          configs={data?.configs ?? []}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </AeroPanel>
    </div>
  )
}
