'use client'

import { useState, useCallback, useEffect } from 'react'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'

// The public feed shows only 'submitted' actions (not processed, not private types).
// This page mirrors that view and lets admins edit descriptions or remove actions.

const PRIVATE_ACTION_TYPES = [
  'epo_engagement',
  'epo_intelligence',
  'poll',
  'ethnic_mobilization',
]

function humanizeActionType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface Party {
  id: string
  name: string
  color: string
}

interface FeedAction {
  id: string
  party_id: string
  action_type: string
  turn: number
  description: string
  status: string
  quality_score: number | null
  language: string
  parties: { name: string; color: string } | null
}

export default function AdminFeedPage() {
  const { data: partiesData } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')

  /** Immediate input; API uses debounced value to avoid a fetch per keystroke. */
  const [turnInput, setTurnInput] = useState('')
  const [turnFilterDebounced, setTurnFilterDebounced] = useState('')
  const [partyFilter, setPartyFilter] = useState('')
  const [actions, setActions] = useState<FeedAction[]>([])
  const [loading, setLoading] = useState(true)

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setTurnFilterDebounced(turnInput.trim()), 350)
    return () => window.clearTimeout(id)
  }, [turnInput])

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (turnFilterDebounced) params.set('turn', turnFilterDebounced)
    if (partyFilter) params.set('party_id', partyFilter)
    params.set('status', 'submitted')

    try {
      const res = await fetch(`/api/admin/actions?${params.toString()}`)
      const data = await res.json()
      // Filter to only public action types (same as the real feed)
      const publicActions = (data.actions ?? []).filter(
        (a: FeedAction) => !PRIVATE_ACTION_TYPES.includes(a.action_type)
      )
      setActions(publicActions)
    } catch {
      setActions([])
    } finally {
      setLoading(false)
    }
  }, [turnFilterDebounced, partyFilter])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  // ── Edit description ─────────────────────────────────────────────────

  function startEdit(action: FeedAction) {
    setEditingId(action.id)
    setEditDescription(action.description)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDescription('')
  }

  async function saveEdit(id: string) {
    setSaving(true)
    try {
      await fetch('/api/admin/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, description: editDescription }),
      })
      cancelEdit()
      fetchFeed()
    } finally {
      setSaving(false)
    }
  }

  // ── Hide from feed (set status to 'withdrawn') ───────────────────────

  async function handleHide(id: string) {
    if (!confirm('Hide this action from the public feed? (Sets status to withdrawn)')) return
    await fetch('/api/admin/actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'withdrawn' }),
    })
    fetchFeed()
  }

  // ── Delete permanently ───────────────────────────────────────────────

  async function handleDelete(id: string) {
    if (!confirm('Permanently delete this action? This cannot be undone.')) return
    await fetch('/api/admin/actions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchFeed()
  }

  // ── Render ───────────────────────────────────────────────────────────

  const partyOptions = [
    { value: '', label: 'All parties' },
    ...(partiesData?.parties ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  // Group by turn
  const byTurn: Record<number, FeedAction[]> = {}
  for (const a of actions) {
    if (!byTurn[a.turn]) byTurn[a.turn] = []
    byTurn[a.turn].push(a)
  }
  const turns = Object.keys(byTurn).map(Number).sort((a, b) => b - a)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Public Feed Manager</h1>
        <p className="text-xs text-text-secondary mb-2">
          This shows exactly what players see on the public feed. Edit descriptions or remove actions.
        </p>
        <div className="glow-line max-w-xs mb-6" />
      </div>

      {/* Filters */}
      <AeroPanel>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">Turn</label>
            <input
              type="number"
              value={turnInput}
              onChange={(e) => setTurnInput(e.target.value)}
              className="aero-input w-20"
              min={1}
              placeholder="All"
            />
          </div>
          <AeroSelect
            label="Party"
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
            options={partyOptions}
          />
          <div className="text-sm text-text-secondary pb-2">
            {actions.length} action{actions.length !== 1 ? 's' : ''} on feed
          </div>
        </div>
      </AeroPanel>

      {/* Feed items */}
      {loading ? (
        <div className="text-sm text-text-secondary animate-pulse">Loading feed...</div>
      ) : actions.length === 0 ? (
        <AeroPanel>
          <p className="text-sm text-text-secondary">No public actions on the feed.</p>
        </AeroPanel>
      ) : (
        turns.map((turn) => (
          <div key={turn}>
            <h2 className="text-xs uppercase tracking-widest text-text-muted mb-2">
              Turn {turn} ({byTurn[turn].length} action{byTurn[turn].length !== 1 ? 's' : ''})
            </h2>
            <div className="space-y-2">
              {byTurn[turn].map((action) => (
                <AeroPanel key={action.id}>
                  <div className="flex items-start gap-3">
                    {/* Party color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: action.parties?.color ?? '#4fd1c5' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {action.parties?.name ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-aero-500/10 text-aero-400 uppercase tracking-wider">
                          {humanizeActionType(action.action_type)}
                        </span>
                        <span className="text-[10px] text-text-secondary font-mono">
                          {action.language}
                        </span>
                      </div>

                      {/* Description — editable or static */}
                      {editingId === action.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="aero-input w-full text-xs min-h-[60px]"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <AeroButton
                              variant="primary"
                              onClick={() => saveEdit(action.id)}
                              loading={saving}
                            >
                              Save
                            </AeroButton>
                            <AeroButton variant="ghost" onClick={cancelEdit}>
                              Cancel
                            </AeroButton>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted mt-1">
                          {action.description || <span className="italic">No description</span>}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    {editingId !== action.id && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(action)}
                          className="text-[10px] px-2 py-1 rounded text-text-secondary hover:text-aero-400 hover:bg-aero-900/30 transition-colors"
                          title="Edit description"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleHide(action.id)}
                          className="text-[10px] px-2 py-1 rounded text-text-secondary hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Hide from feed (keeps action, changes status)"
                        >
                          Hide
                        </button>
                        <button
                          onClick={() => handleDelete(action.id)}
                          className="text-[10px] px-2 py-1 rounded text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Permanently delete action"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </AeroPanel>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
