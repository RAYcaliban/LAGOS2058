'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'

interface Action {
  id: string
  action_type: string
  pc_cost: number
  status: string
  description: string
  created_at: string
}

interface ActionQueueProps {
  actions: Action[]
  totalPCSpent: number
  pcAvailable: number
  submissionOpen: boolean
  onRefetch: () => void
  readOnly?: boolean
}

export function ActionQueue({ actions, totalPCSpent, pcAvailable, submissionOpen, onRefetch, readOnly = false }: ActionQueueProps) {
  const [submitting, setSubmitting] = useState<string | null>(null)

  const drafts = actions.filter((a) => a.status === 'draft')
  const submitted = actions.filter((a) => a.status === 'submitted')
  const processed = actions.filter((a) => a.status === 'processed' || a.status === 'rejected')

  async function submitAction(id: string) {
    setSubmitting(id)
    const supabase = createClient()
    await supabase
      .from('action_submissions')
      .update({ status: 'submitted' })
      .eq('id', id)
    onRefetch()
    setSubmitting(null)
  }

  async function deleteAction(id: string) {
    const supabase = createClient()
    await supabase.from('action_submissions').delete().eq('id', id)
    onRefetch()
  }

  async function submitAll() {
    setSubmitting('all')
    const supabase = createClient()
    const draftIds = drafts.map((a) => a.id)
    await supabase
      .from('action_submissions')
      .update({ status: 'submitted' })
      .in('id', draftIds)
    onRefetch()
    setSubmitting(null)
  }

  return (
    <AeroPanel>
      <div className="flex items-center justify-between mb-3">
        <h2 className="naira-header">Action Queue</h2>
        <div className="text-sm font-mono">
          <span className="text-aero-400 font-bold">{totalPCSpent}</span>
          <span className="text-text-muted"> / {pcAvailable} PC used</span>
        </div>
      </div>
      <div className="glow-line mb-3" />

      {actions.length === 0 ? (
        <p className="text-sm text-text-secondary">No actions yet. Use the form above to create one.</p>
      ) : (
        <div className="space-y-4">
          {/* Drafts */}
          {drafts.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                Drafts ({drafts.length})
              </h3>
              <div className="space-y-2">
                {drafts.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between bg-bg-tertiary/30 rounded px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">
                          {action.action_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-mono text-aero-400">{action.pc_cost} PC</span>
                        <span className="badge badge-warning text-[10px]">draft</span>
                      </div>
                      <p className="text-xs text-text-muted truncate">{action.description}</p>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1 ml-3">
                        {submissionOpen && (
                          <AeroButton
                            variant="primary"
                            onClick={() => submitAction(action.id)}
                            loading={submitting === action.id}
                            className="text-[10px] px-2 py-1"
                          >
                            Submit
                          </AeroButton>
                        )}
                        <button
                          onClick={() => deleteAction(action.id)}
                          className="text-danger/60 hover:text-danger p-1 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!readOnly && drafts.length > 1 && submissionOpen && (
                <AeroButton
                  onClick={submitAll}
                  loading={submitting === 'all'}
                  className="w-full mt-2 text-xs"
                >
                  Submit All Drafts
                </AeroButton>
              )}
            </div>
          )}

          {/* Submitted */}
          {submitted.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                Submitted ({submitted.length})
              </h3>
              {submitted.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2 text-sm py-1.5 border-b border-bg-tertiary/20 last:border-0"
                >
                  <span className="capitalize flex-1">{action.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-mono text-aero-400">{action.pc_cost} PC</span>
                  <span className="badge badge-success text-[10px]">submitted</span>
                </div>
              ))}
            </div>
          )}

          {/* Processed */}
          {processed.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                Processed ({processed.length})
              </h3>
              {processed.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center gap-2 text-sm py-1.5 border-b border-bg-tertiary/20 last:border-0"
                >
                  <span className="capitalize flex-1">{action.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-mono text-aero-400">{action.pc_cost} PC</span>
                  <span className={`badge text-[10px] ${
                    action.status === 'processed' ? 'badge-info' : 'badge-danger'
                  }`}>
                    {action.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AeroPanel>
  )
}
