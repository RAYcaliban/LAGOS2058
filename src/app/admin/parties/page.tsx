'use client'

import { useState } from 'react'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { PartyTable } from '@/components/admin/PartyTable'
import { PartyEditModal } from '@/components/admin/PartyEditModal'
import { PartyPositionsEditor } from '@/components/admin/PartyPositionsEditor'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface Party {
  id: string
  name: string
  full_name: string
  color: string
  owner_id: string | null
  owner_name: string | null
  member_count: number
  created_at: string
  ethnicity: string | null
  religion: string | null
  leader_name: string | null
  positions?: number[] | null
}

interface Profile {
  id: string
  display_name: string
}

export default function AdminPartiesPage() {
  const { data: partiesData, refetch } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')
  const { data: profilesData } = useAdminFetch<{ profiles: Profile[] }>('/api/admin/profiles')
  const [editParty, setEditParty] = useState<Party | null>(null)
  const [deleteParty, setDeleteParty] = useState<Party | null>(null)
  const [positionsParty, setPositionsParty] = useState<Party | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSave(id: string, fields: Record<string, unknown>) {
    setLoading(true)
    await fetch('/api/admin/parties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    setLoading(false)
    setEditParty(null)
    refetch()
  }

  async function handleDelete() {
    if (!deleteParty) return
    setLoading(true)
    await fetch('/api/admin/parties', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteParty.id }),
    })
    setLoading(false)
    setDeleteParty(null)
    refetch()
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="naira-header mb-1">Party Management</h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>
      <AeroPanel>
        <PartyTable
          parties={partiesData?.parties ?? []}
          onEdit={setEditParty}
          onDelete={setDeleteParty}
          onSetPositions={setPositionsParty}
        />
      </AeroPanel>

      {editParty && (
        <PartyEditModal
          party={editParty}
          profiles={profilesData?.profiles ?? []}
          onSave={handleSave}
          onClose={() => setEditParty(null)}
          loading={loading}
        />
      )}

      {positionsParty && (
        <PartyPositionsEditor
          partyId={positionsParty.id}
          partyName={positionsParty.name}
          initialPositions={positionsParty.positions ?? null}
          onSave={async (id, positions) => {
            await handleSave(id, { positions })
            setPositionsParty(null)
          }}
          onClose={() => setPositionsParty(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteParty}
        title="Delete Party"
        message={`Delete "${deleteParty?.full_name}"? All members will be unassigned. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteParty(null)}
        loading={loading}
      />
    </div>
  )
}
