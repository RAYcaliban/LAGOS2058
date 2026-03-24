'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'
import { GameConfigEditor } from '@/components/admin/GameConfigEditor'

interface ConfigRow {
  id: string
  key: string
  value: unknown
  description: string | null
}

// #PLEASE FIX — quick-toggle keys shown as switches at the top of the config page
const TOGGLE_KEYS: { key: string; label: string; description: string }[] = [
  {
    key: 'polls_visible',
    label: 'Show Poll Results to Players',
    description: 'When ON, players see poll bar graphs on their dashboard. Turn OFF to deliver poll results manually.',
  },
  {
    key: 'results_released',
    label: 'Release Election Results',
    description: 'When ON, players can see vote shares and seat counts.',
  },
]

export default function AdminConfigPage() {
  const { data, refetch } = useAdminFetch<{ configs: ConfigRow[] }>('/api/admin/game-config')
  const [toggling, setToggling] = useState<string | null>(null)

  const configs = data?.configs ?? []

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

  async function handleToggle(key: string) {
    setToggling(key)
    const existing = configs.find((c) => c.key === key)
    if (existing) {
      await handleUpdate(existing.id, !(existing.value === true), existing.description ?? '')
    } else {
      const meta = TOGGLE_KEYS.find((t) => t.key === key)
      await handleAdd(key, true, meta?.description ?? '')
    }
    setToggling(null)
  }

  // Filter out toggle keys from the generic editor so they don't show twice
  const toggleKeySet = new Set(TOGGLE_KEYS.map((t) => t.key))
  const otherConfigs = configs.filter((c) => !toggleKeySet.has(c.key))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Game Config</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>

      {/* Quick toggles */}
      <AeroPanel>
        <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-3">Quick Toggles</h2>
        <div className="space-y-3">
          {TOGGLE_KEYS.map((toggle) => {
            const row = configs.find((c) => c.key === toggle.key)
            const isOn = row?.value === true
            return (
              <div key={toggle.key} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-sm">{toggle.label}</div>
                  <div className="text-xs text-text-muted">{toggle.description}</div>
                </div>
                <AeroButton
                  variant={isOn ? 'primary' : 'ghost'}
                  onClick={() => handleToggle(toggle.key)}
                  loading={toggling === toggle.key}
                >
                  {isOn ? 'ON' : 'OFF'}
                </AeroButton>
              </div>
            )
          })}
        </div>
      </AeroPanel>

      {/* Generic key-value editor for everything else */}
      <AeroPanel>
        <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-3">All Config</h2>
        <GameConfigEditor
          configs={otherConfigs}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </AeroPanel>
    </div>
  )
}
