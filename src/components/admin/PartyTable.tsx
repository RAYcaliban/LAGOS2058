'use client'

import { AeroButton } from '@/components/ui/AeroButton'

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
}

interface PartyTableProps {
  parties: Party[]
  onEdit: (party: Party) => void
  onDelete: (party: Party) => void
  onSetPositions?: (party: Party) => void
}

export function PartyTable({ parties, onEdit, onDelete, onSetPositions }: PartyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-widest text-text-secondary border-b border-aero-900/40">
            <th className="text-left py-2 px-2">Color</th>
            <th className="text-left py-2 px-2">Name</th>
            <th className="text-left py-2 px-2">Full Name</th>
            <th className="text-left py-2 px-2">Owner</th>
            <th className="text-left py-2 px-2">Members</th>
            <th className="text-left py-2 px-2">Created</th>
            <th className="text-right py-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {parties.map((p) => (
            <tr key={p.id} className="border-b border-aero-900/20 hover:bg-bg-tertiary/20">
              <td className="py-2 px-2">
                <span
                  className="w-6 h-6 rounded inline-block"
                  style={{ backgroundColor: p.color }}
                />
              </td>
              <td className="py-2 px-2 font-medium">{p.name}</td>
              <td className="py-2 px-2 text-text-secondary">{p.full_name}</td>
              <td className="py-2 px-2 text-text-secondary">{p.owner_name ?? '—'}</td>
              <td className="py-2 px-2 text-center">{p.member_count}</td>
              <td className="py-2 px-2 text-text-muted text-xs">
                {new Date(p.created_at).toLocaleDateString()}
              </td>
              <td className="py-2 px-2 text-right space-x-2">
                {onSetPositions && (
                  <AeroButton variant="ghost" className="text-xs !py-1 !px-2" onClick={() => onSetPositions(p)}>
                    Positions
                  </AeroButton>
                )}
                <AeroButton variant="ghost" className="text-xs !py-1 !px-2" onClick={() => onEdit(p)}>
                  Edit
                </AeroButton>
                <AeroButton variant="danger" className="text-xs !py-1 !px-2" onClick={() => onDelete(p)}>
                  Delete
                </AeroButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {parties.length === 0 && (
        <p className="text-center py-4 text-text-muted text-sm">No parties found.</p>
      )}
    </div>
  )
}
