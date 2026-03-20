'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PartyState {
  id: string
  party_id: string
  turn: number
  pc: number
  cohesion: number
  exposure: number
  momentum: number
  vote_share: number
  seats: number
  awareness: number
  epo_scores: Record<string, Record<string, number>>
  poll_results: unknown | null
  scandal_history: unknown[] | null
  action_history: unknown[] | null
}

export function usePartyState(partyId: string | null | undefined) {
  const [partyState, setPartyState] = useState<PartyState | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    if (!partyId) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data } = await supabaseRef.current
        .from('party_state')
        .select('*')
        .eq('party_id', partyId!)
        .order('turn', { ascending: false })
        .limit(1)
        .single()
      setPartyState(data as unknown as PartyState)
      setLoading(false)
    }
    fetch()
  }, [partyId])

  return { partyState, loading }
}
