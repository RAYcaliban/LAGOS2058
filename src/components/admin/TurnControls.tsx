'use client'

import { useState, useEffect } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { ConfirmDialog } from './ConfirmDialog'
import { PC_HOARDING_CAP } from '@/lib/constants/actions'

interface GameState {
  id: string
  turn: number
  phase: string
  submission_open: boolean
  deadline: string | null
}

interface TurnControlsProps {
  gameState: GameState
  onUpdate: (fields: Record<string, unknown>) => Promise<void>
  onAdvanceTurn: () => Promise<void>
  onInitPartyStates: (turn: number) => Promise<void>
}

const PHASES = [
  { value: 'submission', label: 'Submission' },
  { value: 'resolution', label: 'Resolution' },
  { value: 'results', label: 'Results' },
]

export function TurnControls({ gameState, onUpdate, onAdvanceTurn, onInitPartyStates }: TurnControlsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'advance' | 'init' | null>(null)

  // Local deadline state — only commits on blur or Enter
  const [localDeadline, setLocalDeadline] = useState(gameState.deadline?.slice(0, 16) ?? '')
  useEffect(() => {
    setLocalDeadline(gameState.deadline?.slice(0, 16) ?? '')
  }, [gameState.deadline])

  async function handlePhaseChange(phase: string) {
    setLoading('phase')
    await onUpdate({ phase })
    setLoading(null)
  }

  async function handleSubmissionToggle(open: boolean) {
    setLoading('submission')
    await onUpdate({ submission_open: open })
    setLoading(null)
  }

  async function handleDeadlineChange(deadline: string) {
    setLoading('deadline')
    await onUpdate({ deadline: deadline || null })
    setLoading(null)
  }

  async function handleConfirm() {
    if (confirmAction === 'advance') {
      setLoading('advance')
      await onAdvanceTurn()
    } else if (confirmAction === 'init') {
      setLoading('init')
      await onInitPartyStates(gameState.turn)
    }
    setLoading(null)
    setConfirmAction(null)
  }

  return (
    <div className="space-y-6">
      {/* Current Turn */}
      <div className="text-center">
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Current Turn</div>
        <div className="text-6xl font-display font-bold text-aero-400">{gameState.turn}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phase */}
        <div>
          <AeroSelect
            label="Phase"
            value={gameState.phase}
            onChange={(e) => handlePhaseChange(e.target.value)}
            options={PHASES}
          />
          {loading === 'phase' && <p className="text-xs text-aero-500 mt-1">Updating...</p>}
        </div>

        {/* Submission Toggle */}
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Submissions</div>
          <div className="flex gap-2">
            <AeroButton
              variant={gameState.submission_open ? 'primary' : 'ghost'}
              onClick={() => handleSubmissionToggle(true)}
              loading={loading === 'submission'}
              className="flex-1"
            >
              Open
            </AeroButton>
            <AeroButton
              variant={!gameState.submission_open ? 'danger' : 'ghost'}
              onClick={() => handleSubmissionToggle(false)}
              loading={loading === 'submission'}
              className="flex-1"
            >
              Closed
            </AeroButton>
          </div>
        </div>

        {/* Deadline */}
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
            Deadline (commits on blur or Enter)
          </label>
          <input
            type="datetime-local"
            value={localDeadline}
            onChange={(e) => setLocalDeadline(e.target.value)}
            onBlur={() => { if (localDeadline !== (gameState.deadline?.slice(0, 16) ?? '')) handleDeadlineChange(localDeadline) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDeadlineChange(localDeadline) }}
            className="aero-input w-full"
          />
          {loading === 'deadline' && <p className="text-xs text-aero-500 mt-1">Updating...</p>}
        </div>
      </div>

      {/* Dangerous Actions */}
      <div className="border-t border-aero-900/40 pt-4 space-y-3">
        <div className="text-xs uppercase tracking-widest text-text-secondary">Turn Management</div>
        <div className="flex gap-3">
          <AeroButton onClick={() => setConfirmAction('advance')} loading={loading === 'advance'}>
            Advance Turn
          </AeroButton>
          <AeroButton variant="ghost" onClick={() => setConfirmAction('init')} loading={loading === 'init'}>
            Initialize Party States
          </AeroButton>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === 'advance'}
        title="Advance Turn"
        message={`This will create Turn ${gameState.turn + 1} with phase "submission" and submissions closed. Continue?`}
        confirmLabel="Advance"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading === 'advance'}
      />
      <ConfirmDialog
        open={confirmAction === 'init'}
        title="Initialize Party States"
        message={`This will copy each party's latest state to Turn ${gameState.turn}, adding PC income (capped at ${PC_HOARDING_CAP}). Continue?`}
        confirmLabel="Initialize"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading === 'init'}
      />
    </div>
  )
}
