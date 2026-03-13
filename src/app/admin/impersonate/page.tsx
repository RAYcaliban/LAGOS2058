'use client'

import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { ImpersonateView } from '@/components/admin/ImpersonateView'

interface GameState {
  turn: number
  phase: string
  submission_open: boolean
  deadline: string | null
}

export default function AdminImpersonatePage() {
  const { data: gameState } = useAdminFetch<GameState>('/api/admin/game-state')

  if (!gameState) {
    return (
      <div className="p-6">
        <AeroPanel className="text-center">
          <p className="text-text-secondary">Loading game state...</p>
        </AeroPanel>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Impersonate Party</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <ImpersonateView gameState={gameState} />
    </div>
  )
}
