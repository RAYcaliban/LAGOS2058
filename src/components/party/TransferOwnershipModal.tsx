'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'

interface Member {
  id: string
  display_name: string
  character_name: string | null
}

interface Party {
  id: string
  name: string
  full_name: string
}

interface TransferOwnershipModalProps {
  party: Party
  members: Member[]
  onClose: () => void
  onTransferred: () => void
}

export function TransferOwnershipModal({
  party,
  members,
  onClose,
  onTransferred,
}: TransferOwnershipModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleTransfer() {
    if (!selectedId) return
    setLoading(true)

    const supabase = createClient()
    const newOwner = members.find((m) => m.id === selectedId)
    const newLeaderName = newOwner?.character_name || newOwner?.display_name || null

    const { error } = await supabase
      .from('parties')
      .update({ owner_id: selectedId, leader_name: newLeaderName })
      .eq('id', party.id)

    if (!error) {
      onTransferred()
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <AeroPanel className="w-full max-w-sm">
        <h3 className="naira-header mb-1">Transfer Ownership</h3>
        <p className="text-xs text-text-muted mb-4">
          Select a member to become the new owner of {party.full_name}.
        </p>

        <div className="space-y-2 mb-4">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelectedId(member.id)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                selectedId === member.id
                  ? 'bg-aero-500/20 border border-aero-500/40'
                  : 'bg-bg-tertiary/30 hover:bg-bg-tertiary/50 border border-transparent'
              }`}
            >
              <span className="text-sm font-medium">
                {member.character_name || member.display_name}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <AeroButton variant="ghost" onClick={onClose} className="text-xs">
            Cancel
          </AeroButton>
          <AeroButton
            onClick={handleTransfer}
            loading={loading}
            disabled={!selectedId}
            className="text-xs"
          >
            Confirm Transfer
          </AeroButton>
        </div>
      </AeroPanel>
    </div>
  )
}
