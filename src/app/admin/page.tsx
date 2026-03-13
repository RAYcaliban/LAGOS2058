'use client'

import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { AeroPanel } from '@/components/ui/AeroPanel'
import Link from 'next/link'

interface GameStateData {
  turn: number
  phase: string
  submission_open: boolean
}

interface ProfilesData {
  profiles: unknown[]
}

interface PartiesData {
  parties: unknown[]
}

interface ActionsData {
  count: number
}

const QUICK_LINKS = [
  { href: '/admin/players', label: 'Manage Players', desc: 'Roles & party assignments' },
  { href: '/admin/parties', label: 'Manage Parties', desc: 'Edit, delete, reassign' },
  { href: '/admin/turns', label: 'Turn Controls', desc: 'Phase, deadlines, advance' },
  { href: '/admin/actions', label: 'Review Actions', desc: 'Score & approve submissions' },
  { href: '/admin/results', label: 'Import Results', desc: 'Upload engine output' },
  { href: '/admin/announcements', label: 'Announcements', desc: 'Compose GM broadcasts' },
  { href: '/admin/config', label: 'Game Config', desc: 'Key-value settings' },
  { href: '/admin/impersonate', label: 'Impersonate', desc: 'Submit actions as a party' },
]

export default function AdminDashboard() {
  const { data: gs } = useAdminFetch<GameStateData>('/api/admin/game-state')
  const { data: profiles } = useAdminFetch<ProfilesData>('/api/admin/profiles')
  const { data: parties } = useAdminFetch<PartiesData>('/api/admin/parties')
  const { data: actions } = useAdminFetch<ActionsData>(
    gs ? `/api/admin/actions?turn=${gs.turn}&status=submitted` : null
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500 mb-1">
          GM Dashboard
        </h1>
        <div className="glow-line max-w-xs mb-6" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStatCard
          label="Current Turn"
          value={gs?.turn ?? '—'}
          linkTo="/admin/turns"
        />
        <AdminStatCard
          label="Phase"
          value={gs?.phase ?? '—'}
          linkTo="/admin/turns"
        />
        <AdminStatCard
          label="Submissions"
          value={gs?.submission_open ? 'OPEN' : 'CLOSED'}
          subtitle={gs?.submission_open ? 'Players can submit' : 'Locked'}
          linkTo="/admin/turns"
        />
        <AdminStatCard
          label="Players"
          value={profiles?.profiles?.length ?? '—'}
          linkTo="/admin/players"
        />
        <AdminStatCard
          label="Parties"
          value={parties?.parties?.length ?? '—'}
          linkTo="/admin/parties"
        />
        <AdminStatCard
          label="Actions (this turn)"
          value={actions?.count ?? '—'}
          subtitle="submitted"
          linkTo="/admin/actions"
        />
      </div>

      <AeroPanel>
        <h2 className="naira-header mb-3">Quick Links</h2>
        <div className="glow-line mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="block p-3 rounded border border-aero-900/40 hover:border-aero-700 hover:bg-bg-tertiary/30 transition-colors"
            >
              <div className="text-sm font-semibold text-aero-400">{label}</div>
              <div className="text-xs text-text-muted mt-0.5">{desc}</div>
            </Link>
          ))}
        </div>
      </AeroPanel>
    </div>
  )
}
