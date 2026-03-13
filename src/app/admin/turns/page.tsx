'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'
import { TurnControls } from '@/components/admin/TurnControls'

interface GameState {
  id: string
  turn: number
  phase: string
  submission_open: boolean
  deadline: string | null
}

export default function AdminTurnsPage() {
  const { data: gameState, loading, refetch } = useAdminFetch<GameState>('/api/admin/game-state')
  const [creating, setCreating] = useState(false)

  async function handleUpdate(fields: Record<string, unknown>) {
    if (!gameState) return
    await fetch('/api/admin/game-state', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: gameState.id, ...fields }),
    })
    refetch()
  }

  async function handleAdvanceTurn() {
    await fetch('/api/admin/game-state/advance', { method: 'POST' })
    refetch()
  }

  async function handleInitPartyStates(turn: number) {
    await fetch('/api/admin/party-state/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ turn }),
    })
  }

  async function handleCreateFirstTurn() {
    setCreating(true)
    await fetch('/api/admin/game-state/advance', { method: 'POST' })
    refetch()
    setCreating(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <AeroPanel className="text-center">
          <p className="text-text-secondary">Loading game state...</p>
        </AeroPanel>
      </div>
    )
  }

  if (!gameState) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="naira-header mb-1">Turn Controls</h1>
          <div className="glow-line max-w-xs mb-6" />
        </div>
        <AeroPanel className="text-center space-y-4">
          <p className="text-text-secondary">No game state exists yet. Create Turn 1 to begin.</p>
          <AeroButton onClick={handleCreateFirstTurn} loading={creating}>
            Create Turn 1
          </AeroButton>
        </AeroPanel>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Turn Controls</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <TurnControls
          gameState={gameState}
          onUpdate={handleUpdate}
          onAdvanceTurn={handleAdvanceTurn}
          onInitPartyStates={handleInitPartyStates}
        />
      </AeroPanel>
    </div>
  )
}
