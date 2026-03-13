import { AeroPanel } from '@/components/ui/AeroPanel'
import { CountdownTimer } from '@/components/ui/CountdownTimer'

interface PartyHeaderProps {
  party: { name: string; full_name: string; color: string; leader_name: string | null } | null
  turn: number
  phase: string
  deadline: string | null
  submissionOpen: boolean
}

export function PartyHeader({ party, turn, phase, deadline, submissionOpen }: PartyHeaderProps) {
  if (!party) return null

  return (
    <AeroPanel>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-lg"
            style={{ backgroundColor: party.color, color: '#fff' }}
          >
            {party.name}
          </div>
          <div>
            <h1 className="text-xl font-bold">{party.full_name}</h1>
            {party.leader_name && (
              <p className="text-sm text-text-secondary">Led by {party.leader_name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <div className="naira-header mb-1">Turn</div>
            <div className="text-2xl font-display font-bold text-aero-400">{turn}</div>
          </div>
          <div className="text-center">
            <div className="naira-header mb-1">Phase</div>
            <div className={`badge ${
              phase === 'submission' ? 'badge-success' :
              phase === 'resolution' ? 'badge-warning' :
              'badge-info'
            }`}>
              {phase}
            </div>
          </div>
          <div className="text-center">
            <div className="naira-header mb-1">Deadline</div>
            <CountdownTimer deadline={deadline} />
          </div>
          {phase === 'submission' && (
            <div className="text-center">
              <div className={`text-xs font-semibold ${submissionOpen ? 'text-success' : 'text-danger'}`}>
                {submissionOpen ? 'SUBMISSIONS OPEN' : 'SUBMISSIONS CLOSED'}
              </div>
            </div>
          )}
        </div>
      </div>
    </AeroPanel>
  )
}
