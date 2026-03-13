'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'

interface PartyWithCount {
  id: string
  name: string
  full_name: string
  color: string
  member_count: number
}

export function PartyBrowser({ onJoined }: { onJoined: () => void }) {
  const { user } = useAuth()
  const [parties, setParties] = useState<PartyWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  useEffect(() => {
    async function fetchParties() {
      const supabase = createClient()
      // Fetch all parties
      const { data: allParties } = await supabase
        .from('parties')
        .select('id, name, full_name, color')
        .order('created_at', { ascending: true })

      if (!allParties) {
        setLoading(false)
        return
      }

      // Fetch member counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('party_id')
        .not('party_id', 'is', null)

      const countMap: Record<string, number> = {}
      for (const p of profiles ?? []) {
        if (p.party_id) {
          countMap[p.party_id] = (countMap[p.party_id] || 0) + 1
        }
      }

      setParties(
        allParties.map((p) => ({
          ...p,
          member_count: countMap[p.id] || 0,
        }))
      )
      setLoading(false)
    }

    fetchParties()
  }, [])

  async function joinParty(partyId: string) {
    if (!user) return
    setJoining(partyId)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ party_id: partyId })
      .eq('id', user.id)

    if (!error) {
      onJoined()
    }
    setJoining(null)
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 border-2 border-aero-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (parties.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-6">
        No parties exist yet. Be the first to create one!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {parties.map((party) => (
        <div
          key={party.id}
          className="flex items-center justify-between bg-bg-tertiary/30 rounded-lg px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm"
              style={{ backgroundColor: party.color, color: '#fff' }}
            >
              {party.name}
            </div>
            <div>
              <div className="font-medium">{party.full_name}</div>
              <div className="text-xs text-text-muted">
                {party.member_count} {party.member_count === 1 ? 'member' : 'members'}
              </div>
            </div>
          </div>
          <AeroButton
            onClick={() => joinParty(party.id)}
            loading={joining === party.id}
            className="text-xs px-3 py-1.5"
          >
            Join
          </AeroButton>
        </div>
      ))}
    </div>
  )
}
