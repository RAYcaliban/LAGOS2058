'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { ActionReviewTable } from '@/components/admin/ActionReviewTable'

interface GameState {
  turn: number
}

interface Party {
  id: string
  name: string
  color: string
}

interface Action {
  id: string
  party_id: string
  action_type: string
  pc_cost: number
  status: string
  language: string
  description: string
  params: Record<string, unknown>
  target_lgas: string[] | null
  target_azs: string[] | null
  quality_score: number | null
  gm_notes: string | null
  turn: number
  parties: { name: string; color: string } | null
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'processed', label: 'Processed' },
  { value: 'rejected', label: 'Rejected' },
]

export default function AdminActionsPage() {
  const { data: gs } = useAdminFetch<GameState>('/api/admin/game-state')
  const { data: partiesData } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')

  const [turnOverride, setTurnOverride] = useState<string | null>(null)
  const [partyId, setPartyId] = useState('')
  const [status, setStatus] = useState('')

  // Derive turn from game state unless user has manually set it
  const turn = turnOverride ?? (gs ? String(gs.turn) : '')
  const setTurn = (v: string) => setTurnOverride(v)

  const params = new URLSearchParams()
  if (turn) params.set('turn', turn)
  if (partyId) params.set('party_id', partyId)
  if (status) params.set('status', status)

  const { data: actionsData, refetch } = useAdminFetch<{ actions: Action[]; count: number }>(
    `/api/admin/actions?${params.toString()}`
  )

  async function handleScore(
    id: string,
    fields: { status?: string; quality_score?: number; gm_notes?: string }
  ) {
    await fetch('/api/admin/actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    refetch()
  }

  async function handleBulkApprove(ids: string[]) {
    await fetch('/api/admin/actions/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionIds: ids }),
    })
    refetch()
  }

  async function handleDelete(id: string) {
    await fetch('/api/admin/actions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    refetch()
  }

  async function handleExport() {
    const res = await fetch(`/api/actions/export?turn=${turn}`)
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `actions-turn-${turn}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const partyOptions = [
    { value: '', label: 'All parties' },
    ...(partiesData?.parties ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Action Review & Scoring</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>

      {/* Filters */}
      <AeroPanel>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">Turn</label>
            <input
              type="number"
              value={turn}
              onChange={(e) => setTurn(e.target.value)}
              className="aero-input w-20"
              min={0}
            />
          </div>
          <AeroSelect
            label="Party"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            options={partyOptions}
          />
          <AeroSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <AeroButton variant="ghost" onClick={handleExport} disabled={!turn}>
            Export Actions
          </AeroButton>
        </div>
      </AeroPanel>

      {/* Actions Table */}
      <AeroPanel>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-text-secondary">
            {actionsData?.count ?? 0} action{(actionsData?.count ?? 0) !== 1 ? 's' : ''} found
          </div>
        </div>
        <ActionReviewTable
          actions={actionsData?.actions ?? []}
          onScore={handleScore}
          onBulkApprove={handleBulkApprove}
          onDelete={handleDelete}
        />
      </AeroPanel>
    </div>
  )
}
