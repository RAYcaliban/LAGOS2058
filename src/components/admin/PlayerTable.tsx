'use client'

import { useState } from 'react'
import { AeroInput } from '@/components/ui/AeroInput'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

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

interface PlayerTableProps {
  profiles: Profile[]
  parties: Party[]
  onRoleChange: (id: string, role: string) => void
  onPartyChange: (id: string, partyId: string | null) => void
  onClearCharacter?: (id: string) => void
  onDeletePlayer?: (id: string) => void
}

const ROLES = ['player', 'gm', 'admin']

export function PlayerTable({ profiles, parties, onRoleChange, onPartyChange, onClearCharacter, onDeletePlayer }: PlayerTableProps) {
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.display_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.character_name?.toLowerCase().includes(q) ?? false)
    )
  })

  return (
    <div className="space-y-3">
      <AeroInput
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-text-secondary border-b border-aero-900/40">
              <th className="text-left py-2 px-2">Display Name</th>
              <th className="text-left py-2 px-2">Character</th>
              <th className="text-left py-2 px-2">Email</th>
              <th className="text-left py-2 px-2">Role</th>
              <th className="text-left py-2 px-2">Party</th>
              <th className="text-left py-2 px-2">Joined</th>
              <th className="text-right py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-aero-900/20 hover:bg-bg-tertiary/20">
                <td className="py-2 px-2 font-medium">{p.display_name}</td>
                <td className="py-2 px-2 text-text-secondary">{p.character_name ?? '—'}</td>
                <td className="py-2 px-2 text-text-muted font-mono text-xs">{p.email}</td>
                <td className="py-2 px-2">
                  <select
                    value={p.role}
                    onChange={(e) => onRoleChange(p.id, e.target.value)}
                    className="aero-select text-xs py-1 px-2"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    {p.parties && (
                      <span
                        className="w-3 h-3 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: p.parties.color }}
                      />
                    )}
                    <select
                      value={p.party_id ?? ''}
                      onChange={(e) => onPartyChange(p.id, e.target.value || null)}
                      className="aero-select text-xs py-1 px-2"
                    >
                      <option value="">No party</option>
                      {parties.map((party) => (
                        <option key={party.id} value={party.id}>{party.name}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="py-2 px-2 text-text-muted text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 px-2 text-right space-x-2">
                  {p.character_name && onClearCharacter && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Clear character "${p.character_name}" for ${p.display_name}?`)) {
                          onClearCharacter(p.id)
                        }
                      }}
                      className="text-[10px] text-danger hover:text-danger/80 transition-colors"
                    >
                      Clear Character
                    </button>
                  )}
                  {onDeletePlayer && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="text-[10px] text-danger hover:text-danger/80 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-4 text-text-muted text-sm">No players found.</p>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Player"
        message={deleteTarget ? `Permanently delete ${deleteTarget.display_name} (${deleteTarget.email})? This removes their profile and auth account.` : ''}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => {
          if (deleteTarget && onDeletePlayer) {
            onDeletePlayer(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
