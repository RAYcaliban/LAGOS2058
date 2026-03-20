'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ActionSubmission {
  id: string
  party_id: string
  turn: number
  action_type: string
  params: Record<string, unknown>
  target_lgas: string[] | null
  target_azs: string[] | null
  language: string
  pc_cost: number
  quality_score: number | null
  status: string
  description: string
  gm_notes: string | null
  created_at: string
}

export function useActions(partyId: string | null | undefined, turn: number | null | undefined) {
  const [actions, setActions] = useState<ActionSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchActions = useCallback(async () => {
    if (!partyId || !turn) {
      setLoading(false)
      return
    }

    const { data } = await supabaseRef.current
      .from('action_submissions')
      .select('*')
      .eq('party_id', partyId)
      .eq('turn', turn)
      .order('created_at', { ascending: true })

    setActions((data ?? []) as unknown as ActionSubmission[])
    setLoading(false)
  }, [partyId, turn])

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  const totalPCSpent = actions
    .filter((a) => a.status !== 'rejected')
    .reduce((sum, a) => sum + a.pc_cost, 0)

  return { actions, loading, totalPCSpent, refetch: fetchActions }
}
