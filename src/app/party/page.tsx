'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useParty } from '@/lib/hooks/useParty'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { PageHeader } from '@/components/layout/PageHeader'
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
      <>
        <PageHeader
          title="PARTY HUB"
          label="Fifth Republic · Political Parties"
          image="/images/govt-building.jpg"
          wash="green"
          subtitle="Your party's command centre."
        />
        <FixedWidthContainer className="py-10">
          <PartyDetails
            party={party}
            members={members}
            userId={user?.id ?? ''}
            isOwner={isOwner}
            onRefetch={refetch}
          />
        </FixedWidthContainer>
      </>
    )
  }

  // No party — show browse/create tabs
  return (
    <>
      <PageHeader
        title="PARTY HUB"
        label="Fifth Republic · Political Parties"
        image="/images/govt-building.jpg"
        wash="green"
        subtitle="Join an existing party or register your own to enter the campaign."
      />
      <FixedWidthContainer className="py-10">
        <AeroPanel className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="pixel-brand text-3xl text-white tracking-widest">
              PARTY HUB
            </h2>
            <div className="glow-line mt-2" />
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('browse')}
              className={`flex-1 py-2 text-sm font-medium tracking-wider uppercase transition-colors ${
                tab === 'browse'
                  ? 'bg-nigeria-500/20 text-nigeria-400 border border-nigeria-500/40'
                  : 'bg-bg-tertiary/30 text-text-muted hover:text-text-secondary border border-transparent'
              }`}
            >
              Browse Parties
            </button>
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-sm font-medium tracking-wider uppercase transition-colors ${
                tab === 'create'
                  ? 'bg-nigeria-500/20 text-nigeria-400 border border-nigeria-500/40'
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
    </>
  )
}

export default function PartyHubPage() {
  return (
    <AuthGuard requireCharacter>
      <PartyHubContent />
    </AuthGuard>
  )
}
