'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useParty } from '@/lib/hooks/useParty'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { PartyBrowser } from '@/components/party/PartyBrowser'
import { CreatePartyForm } from '@/components/party/CreatePartyForm'
import { PartyDetails } from '@/components/party/PartyDetails'

function PartyHubContent() {
  const { user, profile } = useAuth()
  const { party, members, loading, isOwner, refetch } = useParty(profile?.party_id, user?.id)
  const [tab, setTab] = useState<'browse' | 'create'>('browse')

  if (loading) {
    return (
      <FixedWidthContainer className="py-10">
        <div className="flex justify-center">
          <div className="w-6 h-6 border-2 border-aero-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </FixedWidthContainer>
    )
  }

  // User already in a party — show party details
  if (profile?.party_id && party) {
    return (
      <FixedWidthContainer className="py-10">
        <PartyDetails
          party={party}
          members={members}
          userId={user?.id ?? ''}
          isOwner={isOwner}
          onRefetch={refetch}
        />
      </FixedWidthContainer>
    )
  }

  // No party — show browse/create tabs
  return (
    <FixedWidthContainer className="py-10">
      <AeroPanel className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500">
            PARTY HUB
          </h1>
          <div className="glow-line mt-2" />
          <p className="text-sm text-text-secondary mt-2">
            Join an existing party or create your own
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
              tab === 'browse'
                ? 'bg-aero-500/20 text-aero-400 border border-aero-500/40'
                : 'bg-bg-tertiary/30 text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            Browse Parties
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
              tab === 'create'
                ? 'bg-aero-500/20 text-aero-400 border border-aero-500/40'
                : 'bg-bg-tertiary/30 text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            Create Party
          </button>
        </div>

        {tab === 'browse' ? (
          <PartyBrowser onJoined={refetch} />
        ) : (
          <CreatePartyForm />
        )}
      </AeroPanel>
    </FixedWidthContainer>
  )
}

export default function PartyHubPage() {
  return (
    <AuthGuard requireCharacter>
      <PartyHubContent />
    </AuthGuard>
  )
}
