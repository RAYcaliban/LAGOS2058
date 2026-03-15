'use client'

import { useState } from 'react'
import { AeroPanel } from '@/components/ui/AeroPanel'

interface ActionHistoryProps {
  actionHistory: unknown[]
}

interface ActionEntry {
  turn: number
  action_type: string
  description: string
  pc_cost: number
  status: string
  quality_score?: number | null
  gm_notes?: string | null
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-success'
  if (score >= 5) return 'text-aero-400'
  if (score >= 3) return 'text-parchment-500'
  return 'text-danger'
}

function ActionEntryRow({ entry }: { entry: ActionEntry }) {
  const [showNotes, setShowNotes] = useState(false)
  const hasNotes = entry.gm_notes && entry.gm_notes.trim().length > 0

  return (
    <div className="text-sm py-2 border-b border-bg-tertiary/20 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-text-muted w-8 shrink-0">T{entry.turn}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize">{entry.action_type.replace(/_/g, ' ')}</span>
            <span className="text-xs text-aero-400 font-mono">{entry.pc_cost} PC</span>
            {entry.status === 'processed' && entry.quality_score != null && (
              <span className={`text-xs font-mono font-semibold ${scoreColor(entry.quality_score)}`}>
                Q{entry.quality_score.toFixed(1)}
              </span>
            )}
          </div>
          {entry.description && (
            <p className="text-xs text-text-muted truncate">{entry.description}</p>
          )}
          {hasNotes && (
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-[10px] text-aero-400 hover:text-aero-300 mt-0.5"
            >
              {showNotes ? 'Hide GM Notes' : 'GM Notes'}
            </button>
          )}
          {showNotes && hasNotes && (
            <p className="text-xs text-parchment-500 bg-parchment-900/10 rounded px-2 py-1 mt-1">
              {entry.gm_notes}
            </p>
          )}
        </div>
        <span className={`badge text-[10px] ${
          entry.status === 'processed' ? 'badge-success' :
          entry.status === 'submitted' ? 'badge-info' :
          entry.status === 'rejected' ? 'badge-danger' :
          'badge-warning'
        }`}>
          {entry.status}
        </span>
      </div>
    </div>
  )
}

export function ActionHistory({ actionHistory }: ActionHistoryProps) {
  const entries = (actionHistory ?? []) as ActionEntry[]

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">Action History</h2>
      <div className="glow-line mb-3" />

      {entries.length === 0 ? (
        <p className="text-sm text-text-secondary">No actions submitted yet.</p>
      ) : (
        <div className="space-y-0 max-h-64 overflow-y-auto">
          {entries.slice().reverse().map((entry, i) => (
            <ActionEntryRow key={i} entry={entry} />
          ))}
        </div>
      )}
    </AeroPanel>
  )
}
