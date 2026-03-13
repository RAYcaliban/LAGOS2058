import { AeroPanel } from '@/components/ui/AeroPanel'

interface PollResultsProps {
  pollResults: unknown
}

interface PollEntry {
  turn: number
  tier: number
  zone?: string
  results: Record<string, number>
}

export function PollResults({ pollResults }: PollResultsProps) {
  const polls = (pollResults ?? []) as PollEntry[]

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">Poll Results</h2>
      <div className="glow-line mb-3" />

      {polls.length === 0 ? (
        <p className="text-sm text-text-secondary">No polls conducted yet. Use the Poll action to commission one.</p>
      ) : (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {polls.slice().reverse().map((poll, i) => (
            <div key={i} className="border-b border-bg-tertiary/20 pb-3 last:border-0">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                <span className="font-mono">Turn {poll.turn}</span>
                <span className="badge-info badge text-[10px]">Tier {poll.tier}</span>
                {poll.zone && <span>{poll.zone}</span>}
              </div>
              <div className="space-y-1">
                {Object.entries(poll.results)
                  .sort(([, a], [, b]) => b - a)
                  .map(([party, share]) => (
                    <div key={party} className="flex items-center gap-2 text-sm">
                      <span className="w-12 font-mono font-medium">{party}</span>
                      <div className="flex-1 bg-bg-tertiary rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-aero-500"
                          style={{ width: `${share * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-xs">
                        {(share * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </AeroPanel>
  )
}
