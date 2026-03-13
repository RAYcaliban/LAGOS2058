'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { ActionScoreForm } from './ActionScoreForm'
import { ActionExpandedRow } from './ActionExpandedRow'
import { ACTION_LABELS } from '@/lib/constants/actions'

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

interface ActionReviewTableProps {
  actions: Action[]
  onScore: (id: string, fields: { status?: string; quality_score?: number; gm_notes?: string }) => Promise<void>
  onBulkApprove: (ids: string[]) => Promise<void>
}

export function ActionReviewTable({ actions, onScore, onBulkApprove }: ActionReviewTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Actions that have been scored but not yet approved
  const scoredNotApproved = actions.filter(
    (a) => a.quality_score !== null && a.status === 'submitted'
  )

  async function handleBulkApprove() {
    setBulkLoading(true)
    await onBulkApprove(scoredNotApproved.map((a) => a.id))
    setBulkLoading(false)
  }

  const statusBadge = (status: string) => {
    const cls =
      status === 'submitted' ? 'badge-warning' :
      status === 'processed' ? 'badge-success' :
      status === 'rejected' ? 'badge-danger' :
      'badge-info'
    return <span className={`badge ${cls}`}>{status}</span>
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-text-secondary border-b border-aero-900/40">
              <th className="text-left py-2 px-2">Party</th>
              <th className="text-left py-2 px-2">Action</th>
              <th className="text-left py-2 px-2">PC</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Score</th>
              <th className="text-left py-2 px-2">Lang</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-right py-2 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <>
                <tr
                  key={action.id}
                  className="border-b border-aero-900/20 hover:bg-bg-tertiary/20 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === action.id ? null : action.id)}
                >
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-1.5">
                      {action.parties && (
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: action.parties.color }}
                        />
                      )}
                      <span className="font-medium">{action.parties?.name ?? '?'}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2">{ACTION_LABELS[action.action_type as keyof typeof ACTION_LABELS] ?? action.action_type}</td>
                  <td className="py-2 px-2 font-mono">{action.pc_cost}</td>
                  <td className="py-2 px-2">{statusBadge(action.status)}</td>
                  <td className="py-2 px-2 font-mono">{action.quality_score ?? '—'}</td>
                  <td className="py-2 px-2 text-text-muted">{action.language}</td>
                  <td className="py-2 px-2 text-text-secondary max-w-xs truncate">{action.description}</td>
                  <td className="py-2 px-2 text-right text-text-muted">
                    {expandedId === action.id ? '▲' : '▼'}
                  </td>
                </tr>
                {expandedId === action.id && (
                  <tr key={`${action.id}-expanded`}>
                    <td colSpan={8} className="p-4 bg-bg-tertiary/30 border-b border-aero-900/20">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ActionExpandedRow action={action} />
                        <ActionScoreForm
                          action={action}
                          onScore={(fields) => onScore(action.id, fields)}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {actions.length === 0 && (
          <p className="text-center py-4 text-text-muted text-sm">No actions found.</p>
        )}
      </div>

      {scoredNotApproved.length > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t border-aero-900/40">
          <AeroButton onClick={handleBulkApprove} loading={bulkLoading}>
            Approve All Reviewed ({scoredNotApproved.length})
          </AeroButton>
        </div>
      )}
    </div>
  )
}
