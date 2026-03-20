'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PartyMember {
  id: string
  display_name: string
  character_name: string | null
  avatar_url: string | null
}

interface Party {
  id: string
  name: string
  full_name: string
  color: string
  leader_name: string | null
  owner_id: string | null
  ethnicity: string | null
  religion: string | null
  religion_display: string | null
  description: string | null
  logo_url: string | null
}

export function useParty(partyId: string | null | undefined, userId: string | null | undefined) {
  const [party, setParty] = useState<Party | null>(null)
  const [members, setMembers] = useState<PartyMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const refetch = useCallback(async () => {
    if (!partyId) {
      setParty(null)
      setMembers([])
      setLoading(false)
      return
    }

    const [partyRes, membersRes] = await Promise.all([
      supabaseRef.current.from('parties').select('*').eq('id', partyId).single(),
      supabaseRef.current
        .from('profiles')
        .select('id, display_name, character_name, avatar_url')
        .eq('party_id', partyId),
    ])

    setParty(partyRes.data)
    setMembers(membersRes.data ?? [])
    setLoading(false)
  }, [partyId])

  useEffect(() => {
    setLoading(true)
    refetch()
  }, [refetch])

  return {
    party,
    members,
    loading,
    isOwner: !!party?.owner_id && party.owner_id === userId,
    refetch,
  }
}
