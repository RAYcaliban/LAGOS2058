'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'
import { TransferOwnershipModal } from './TransferOwnershipModal'

interface Member {
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
}

interface PartyDetailsProps {
  party: Party
  members: Member[]
  userId: string
  isOwner: boolean
  onRefetch: () => void
}

export function PartyDetails({ party, members, userId, isOwner, onRefetch }: PartyDetailsProps) {
  const [showTransfer, setShowTransfer] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const router = useRouter()

  async function handleLeave() {
    if (isOwner) return // Owner must transfer first
    setLeaving(true)
    const supabase = createClient()
    await supabase
      .from('profiles')
      .update({ party_id: null })
      .eq('id', userId)
    onRefetch()
    router.refresh()
    setLeaving(false)
  }

  return (
    <AeroPanel>
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center font-display font-bold text-lg"
          style={{ backgroundColor: party.color, color: '#fff' }}
        >
          {party.name}
        </div>
        <div>
          <h2 className="text-xl font-bold">{party.full_name}</h2>
          {party.leader_name && (
            <p className="text-sm text-text-secondary">Led by {party.leader_name}</p>
          )}
        </div>
      </div>

      <div className="glow-line mb-4" />

      <h3 className="naira-header mb-2">Members ({members.length})</h3>
      <div className="space-y-2 mb-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-bg-tertiary/30 rounded px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {member.character_name || member.display_name}
              </span>
              {member.id === party.owner_id && (
                <span className="badge badge-warning text-[10px]">owner</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {isOwner && members.length > 1 && (
          <AeroButton
            variant="ghost"
            onClick={() => setShowTransfer(true)}
            className="text-xs"
          >
            Transfer Ownership
          </AeroButton>
        )}
        {isOwner ? (
          <div className="relative group">
            <AeroButton
              variant="danger"
              disabled
              className="text-xs opacity-50 cursor-not-allowed"
            >
              Leave Party
            </AeroButton>
            <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-bg-secondary border border-border-subtle rounded px-2 py-1 text-[10px] text-text-muted whitespace-nowrap">
              Transfer ownership first
            </div>
          </div>
        ) : (
          <AeroButton
            variant="danger"
            onClick={handleLeave}
            loading={leaving}
            className="text-xs"
          >
            Leave Party
          </AeroButton>
        )}
      </div>

      {showTransfer && (
        <TransferOwnershipModal
          party={party}
          members={members.filter((m) => m.id !== userId)}
          onClose={() => setShowTransfer(false)}
          onTransferred={onRefetch}
        />
      )}
    </AeroPanel>
  )
}
