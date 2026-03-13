'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { ImpersonateBanner } from './ImpersonateBanner'
import { PartyHeader } from '@/components/dashboard/PartyHeader'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { ActionBuilder } from '@/components/actions/ActionBuilder'
import { ActionQueue } from '@/components/actions/ActionQueue'

interface Party {
  id: string
  name: string
  full_name: string
  color: string
  leader_name: string | null
}

interface GameState {
  turn: number
  phase: string
  submission_open: boolean
  deadline: string | null
}

interface Action {
  id: string
  action_type: string
  pc_cost: number
  status: string
  description: string
  created_at: string
}

interface ImpersonateViewProps {
  gameState: GameState
}

export function ImpersonateView({ gameState }: ImpersonateViewProps) {
  const [parties, setParties] = useState<Party[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [partyState, setPartyState] = useState<{
    pc: number; cohesion: number; exposure: number; momentum: number
    vote_share: number; seats: number; awareness: number
  } | null>(null)
  const [actions, setActions] = useState<Action[]>([])

  const supabase = createClient()

  // Load parties
  useEffect(() => {
    supabase.from('parties').select('id, name, full_name, color, leader_name').then(({ data }) => {
      setParties(data ?? [])
    })
  }, [supabase])

  const fetchData = useCallback(async () => {
    if (!selectedId) {
      setPartyState(null)
      setActions([])
      return
    }

    // Fetch party state
    const { data: ps } = await supabase
      .from('party_state')
      .select('pc, cohesion, exposure, momentum, vote_share, seats, awareness')
      .eq('party_id', selectedId)
      .order('turn', { ascending: false })
      .limit(1)
      .single()
    setPartyState(ps)

    // Fetch actions for this turn
    const { data: acts } = await supabase
      .from('action_submissions')
      .select('id, action_type, pc_cost, status, description, created_at')
      .eq('party_id', selectedId)
      .eq('turn', gameState.turn)
      .order('created_at')
    setActions(acts ?? [])
  }, [selectedId, gameState.turn, supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const selectedParty = parties.find((p) => p.id === selectedId)
  const totalPCSpent = actions
    .filter((a) => a.status === 'draft' || a.status === 'submitted')
    .reduce((sum, a) => sum + (a.pc_cost || 0), 0)

  async function handleImpersonateSave(action: {
    action_type: string
    params: Record<string, unknown>
    target_lgas: string[]
    target_azs: string[]
    language: string
    description: string
    pc_cost: number
  }) {
    await fetch('/api/admin/impersonate/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        party_id: selectedId,
        turn: gameState.turn,
        ...action,
      }),
    })
  }

  return (
    <div className="space-y-4">
      <AeroSelect
        label="Select Party to Impersonate"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        options={parties.map((p) => ({ value: p.id, label: `${p.name} — ${p.full_name}` }))}
        placeholder="Choose a party..."
      />

      {selectedParty && (
        <>
          <ImpersonateBanner partyName={selectedParty.full_name} partyColor={selectedParty.color} />
          <PartyHeader
            party={selectedParty}
            turn={gameState.turn}
            phase={gameState.phase}
            deadline={gameState.deadline}
            submissionOpen={gameState.submission_open}
          />
          <StatsGrid partyState={partyState} />

          <ActionBuilder
            partyId={selectedId}
            turn={gameState.turn}
            pcAvailable={partyState?.pc ?? 0}
            totalPCSpent={totalPCSpent}
            onActionCreated={fetchData}
            onSave={handleImpersonateSave}
          />

          <ActionQueue
            actions={actions}
            totalPCSpent={totalPCSpent}
            pcAvailable={partyState?.pc ?? 0}
            submissionOpen={gameState.submission_open}
            onRefetch={fetchData}
          />
        </>
      )}
    </div>
  )
}
