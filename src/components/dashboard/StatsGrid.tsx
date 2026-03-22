import { AeroPanel } from '@/components/ui/AeroPanel'
import { PC_HOARDING_CAP } from '@/lib/constants/actions'

interface StatsGridProps {
  partyState: {
    pc: number
    cohesion: number
    exposure: number
    momentum: number
    vote_share: number
    seats: number
    awareness: number
  } | null
  /** Election results only visible to players when admin has revealed them. */
  resultsReleased?: boolean
}

function StatCard({ label, value, subtext, color }: {
  label: string
  value: string | number
  subtext?: string
  color?: string
}) {
  return (
    <div className="text-center space-y-1">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
      {subtext && <div className="text-xs text-text-muted">{subtext}</div>}
    </div>
  )
}

function getCohesionColor(cohesion: number): string {
  if (cohesion >= 70) return '#10b981' // green
  if (cohesion >= 40) return '#f59e0b' // amber
  return '#ef4444' // red
}

function getMomentumArrow(momentum: number): string {
  if (momentum > 0.5) return '\u2191\u2191' // ↑↑
  if (momentum > 0) return '\u2191'  // ↑
  if (momentum < -0.5) return '\u2193\u2193' // ↓↓
  if (momentum < 0) return '\u2193'  // ↓
  return '\u2194' // ↔
}

export function StatsGrid({ partyState, resultsReleased }: StatsGridProps) {
  if (!partyState) {
    return (
      <AeroPanel>
        <p className="text-center text-text-secondary">No party state data yet. The game hasn&apos;t started.</p>
      </AeroPanel>
    )
  }

  const { pc, cohesion, exposure, momentum, vote_share, seats, awareness } = partyState
  const pcNearCap = pc >= PC_HOARDING_CAP - 2
  const exposureHigh = exposure > 70

  return (
    <AeroPanel>
      <h2 className="naira-header mb-4">Party Stats</h2>
      <div className="glow-line mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          label="Political Capital"
          value={pc}
          subtext={pcNearCap ? `Cap: ${PC_HOARDING_CAP}` : undefined}
          color={pcNearCap ? '#f59e0b' : undefined}
        />
        <StatCard
          label="Cohesion"
          value={`${cohesion.toFixed(0)}%`}
          color={getCohesionColor(cohesion)}
        />
        <StatCard
          label="Exposure"
          value={`${exposure.toFixed(0)}%`}
          subtext={exposureHigh ? 'Scandal risk!' : undefined}
          color={exposureHigh ? '#ef4444' : undefined}
        />
        <StatCard
          label="Momentum"
          value={`${getMomentumArrow(momentum)} ${momentum > 0 ? '+' : ''}${momentum.toFixed(1)}`}
        />
        <StatCard
          label="Vote Share"
          value={resultsReleased ? `${(vote_share * 100).toFixed(1)}%` : 'TBD'}
          color={!resultsReleased ? '#6b7280' : undefined}
        />
        <StatCard
          label="Seats"
          value={resultsReleased ? `${seats}/622` : 'TBD'}
          color={!resultsReleased ? '#6b7280' : undefined}
        />
        <div className="text-center space-y-1">
          <div className="stat-label">Awareness</div>
          <div className="w-full bg-bg-tertiary rounded-full h-3 mt-2">
            <div
              className="h-3 rounded-full bg-aero-500 transition-all"
              style={{ width: `${awareness * 100}%` }}
            />
          </div>
          <div className="text-xs font-mono text-aero-400">{(awareness * 100).toFixed(0)}%</div>
        </div>
      </div>
    </AeroPanel>
  )
}
