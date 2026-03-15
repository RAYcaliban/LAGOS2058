'use client'

import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { PlayerTable } from '@/components/admin/PlayerTable'

interface Profile {
  id: string
  display_name: string
  character_name: string | null
  email: string
  role: string
  party_id: string | null
  created_at: string
  parties: { name: string; color: string } | null
}

interface Party {
  id: string
  name: string
  color: string
}

export default function AdminPlayersPage() {
  const { data: profilesData, refetch: refetchProfiles } = useAdminFetch<{ profiles: Profile[] }>('/api/admin/profiles')
  const { data: partiesData } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')

  async function handleRoleChange(id: string, role: string) {
    await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    refetchProfiles()
  }

  async function handlePartyChange(id: string, partyId: string | null) {
    await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, party_id: partyId }),
    })
    refetchProfiles()
  }

  async function handleClearCharacter(id: string) {
    await fetch('/api/admin/profiles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    refetchProfiles()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Player Management</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <PlayerTable
          profiles={profilesData?.profiles ?? []}
          parties={partiesData?.parties ?? []}
          onRoleChange={handleRoleChange}
          onPartyChange={handlePartyChange}
          onClearCharacter={handleClearCharacter}
        />
      </AeroPanel>
    </div>
  )
}
