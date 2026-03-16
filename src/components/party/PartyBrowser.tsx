'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { AeroButton } from '@/components/ui/AeroButton'

interface PartyWithCount {
  id: string
  name: string
  full_name: string
  color: string
  ethnicity: string | null
  religion: string | null
  description: string | null
  logo_url: string | null
  member_count: number
}

export function PartyBrowser({ onJoined }: { onJoined: () => void }) {
  const { user } = useAuth()
  const [parties, setParties] = useState<PartyWithCount[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function fetchParties() {
      const supabase = createClient()
      const { data: allParties } = await supabase
        .from('parties')
        .select('*')
        .order('created_at', { ascending: true })

      if (!allParties) { setLoading(false); return }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('party_id')
        .not('party_id', 'is', null)

      const countMap: Record<string, number> = {}
      for (const p of profiles ?? []) {
        if (p.party_id) countMap[p.party_id] = (countMap[p.party_id] || 0) + 1
      }

      setParties(allParties.map((p) => ({ ...p, member_count: countMap[p.id] || 0 })))
      setLoading(false)
    }

    fetchParties()
  }, [])

  async function joinParty(partyId: string) {
    if (!user) return
    setJoining(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ party_id: partyId })
      .eq('id', user.id)
    if (!error) onJoined()
    setJoining(false)
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

  const party = parties[index]

  return (
    <div className="space-y-4">
      {/* Card */}
      <div className="rounded-lg overflow-hidden border border-border-primary">
        {/* Color banner */}
        <div className="h-2" style={{ backgroundColor: party.color }} />

        <div className="p-5 space-y-4">
          {/* Logo + name row */}
          <div className="flex items-center gap-4">
            {party.logo_url ? (
              <img
                src={party.logo_url}
                alt={`${party.name} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-border-primary flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center font-display font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: party.color, color: '#fff' }}
              >
                {party.name}
              </div>
            )}
            <div>
              <div className="font-display font-bold text-lg tracking-wide" style={{ color: party.color }}>
                {party.name}
              </div>
              <div className="font-medium text-text-primary">{party.full_name}</div>
              <div className="text-xs text-text-muted mt-0.5">
                {party.member_count} {party.member_count === 1 ? 'member' : 'members'}
              </div>
            </div>
          </div>

          {/* Tags */}
          {(party.ethnicity || party.religion) && (
            <div className="flex gap-2 flex-wrap">
              {party.ethnicity && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-border-primary text-text-secondary">
                  {party.ethnicity}
                </span>
              )}
              {party.religion && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-border-primary text-text-secondary">
                  {party.religion}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {party.description ? (
            <p className="text-sm text-text-secondary leading-relaxed">{party.description}</p>
          ) : (
            <p className="text-sm text-text-muted italic">No description provided.</p>
          )}
        </div>
      </div>

      {/* Navigation + join */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => (i - 1 + parties.length) % parties.length)}
          disabled={parties.length <= 1}
          className="w-9 h-9 rounded-lg border border-border-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-aero-500 transition-colors disabled:opacity-30"
        >
          ‹
        </button>

        <span className="text-xs text-text-muted flex-1 text-center">
          {index + 1} / {parties.length}
        </span>

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % parties.length)}
          disabled={parties.length <= 1}
          className="w-9 h-9 rounded-lg border border-border-primary flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-aero-500 transition-colors disabled:opacity-30"
        >
          ›
        </button>

        <AeroButton
          onClick={() => joinParty(party.id)}
          loading={joining}
          className="flex-1"
        >
          Join {party.name}
        </AeroButton>
      </div>
    </div>
  )
}
