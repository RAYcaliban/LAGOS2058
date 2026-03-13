'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroInput } from '@/components/ui/AeroInput'

interface Profile {
  id: string
  display_name: string
}

interface PartyEditModalProps {
  party: {
    id: string
    name: string
    full_name: string
    color: string
    ethnicity: string | null
    religion: string | null
    leader_name: string | null
    owner_id: string | null
  }
  profiles: Profile[]
  onSave: (id: string, fields: Record<string, unknown>) => void
  onClose: () => void
  loading?: boolean
}

export function PartyEditModal({ party, profiles, onSave, onClose, loading }: PartyEditModalProps) {
  const [name, setName] = useState(party.name)
  const [fullName, setFullName] = useState(party.full_name)
  const [color, setColor] = useState(party.color)
  const [ethnicity, setEthnicity] = useState(party.ethnicity ?? '')
  const [religion, setReligion] = useState(party.religion ?? '')
  const [leaderName, setLeaderName] = useState(party.leader_name ?? '')
  const [ownerId, setOwnerId] = useState(party.owner_id ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(party.id, {
      name,
      full_name: fullName,
      color,
      ethnicity: ethnicity || null,
      religion: religion || null,
      leader_name: leaderName || null,
      owner_id: ownerId || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="aero-panel p-6 relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="font-display text-lg font-bold text-aero-400 mb-4">Edit Party</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <AeroInput label="Abbreviation" value={name} onChange={(e) => setName(e.target.value)} />
          <AeroInput label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-text-secondary">Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
              <span className="text-sm font-mono text-text-muted">{color}</span>
            </div>
          </div>
          <AeroInput label="Ethnicity" value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} />
          <AeroInput label="Religion" value={religion} onChange={(e) => setReligion(e.target.value)} />
          <AeroInput label="Leader Name" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-widest text-text-secondary">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="aero-select"
            >
              <option value="">No owner</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <AeroButton variant="ghost" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </AeroButton>
            <AeroButton type="submit" loading={loading}>
              Save
            </AeroButton>
          </div>
        </form>
      </div>
    </div>
  )
}
