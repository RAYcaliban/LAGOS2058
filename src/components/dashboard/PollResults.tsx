import { AeroPanel } from '@/components/ui/AeroPanel'
import { ISSUE_BY_KEY, type IssueKey } from '@/lib/constants/issues'

interface PollResultsProps {
  pollResults: unknown
}

/** Shape of a poll result from the engine (via bridge → party_state). */
interface PollEntry {
  turn_commissioned: number
  turn_delivered: number
  commissioned_by: string
  poll_tier: number
  scope: string
  margin_of_error: number
  issue_positions: Record<string, Record<string, number>>
  dimensions_polled: string[]
}

const TIER_LABELS: Record<number, string> = {
  1: 'National',
  2: 'Zonal',
  3: 'State',
  4: 'State (precise)',
  5: 'LGA-level',
}

/** Map a -5..+5 position to a percentage for the bar (0% = -5, 100% = +5). */
function positionToPercent(pos: number): number {
  return ((pos + 5) / 10) * 100
}

/** Color for a position value: red (negative) → gray (neutral) → teal (positive). */
function positionColor(pos: number): string {
  if (pos > 1.5) return '#2dd4bf'  // teal
  if (pos > 0.5) return '#5eead4'  // light teal
  if (pos > -0.5) return '#9ca3af' // gray
  if (pos > -1.5) return '#fbbf24' // amber
  return '#f87171'                  // red
}

function humanizeKey(key: string): string {
  const desc = ISSUE_BY_KEY[key as IssueKey]
  return desc?.label ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
        <div className="space-y-6 max-h-[32rem] overflow-y-auto">
          {polls.slice().reverse().map((poll, pollIdx) => {
            const geos = Object.keys(poll.issue_positions)
            const dimensions = poll.dimensions_polled

            return (
              <div key={pollIdx} className="border-b border-bg-tertiary/20 pb-4 last:border-0">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-text-muted mb-3">
                  <span className="font-mono">Turn {poll.turn_commissioned}</span>
                  <span className="px-1.5 py-0.5 rounded bg-aero-500/10 text-aero-400 text-[10px] uppercase tracking-wider">
                    Tier {poll.poll_tier} — {TIER_LABELS[poll.poll_tier] ?? poll.scope}
                  </span>
                  <span className="text-text-secondary">
                    ±{poll.margin_of_error.toFixed(1)} margin
                  </span>
                </div>

                {/* One bar chart per dimension */}
                <div className="space-y-4">
                  {dimensions.map((dimKey) => (
                    <div key={dimKey}>
                      <div className="text-xs font-medium text-text-primary mb-1.5">
                        {humanizeKey(dimKey)}
                      </div>
                      <div className="space-y-1">
                        {geos.map((geo) => {
                          const pos = poll.issue_positions[geo]?.[dimKey]
                          if (pos == null) return null
                          const pct = positionToPercent(pos)
                          const moeLeft = positionToPercent(Math.max(-5, pos - poll.margin_of_error))
                          const moeRight = positionToPercent(Math.min(5, pos + poll.margin_of_error))

                          return (
                            <div key={geo} className="flex items-center gap-2">
                              <span className="w-24 text-[10px] text-text-muted truncate shrink-0" title={geo}>
                                {geo}
                              </span>
                              <div className="flex-1 relative h-4 bg-bg-tertiary/40 rounded-sm overflow-hidden">
                                {/* Center line at 0 */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-text-secondary/20" />
                                {/* Margin of error band */}
                                <div
                                  className="absolute top-0.5 bottom-0.5 rounded-sm opacity-25"
                                  style={{
                                    left: `${moeLeft}%`,
                                    width: `${moeRight - moeLeft}%`,
                                    backgroundColor: positionColor(pos),
                                  }}
                                />
                                {/* Position marker */}
                                <div
                                  className="absolute top-0 bottom-0 w-1.5 rounded-sm"
                                  style={{
                                    left: `${pct}%`,
                                    transform: 'translateX(-50%)',
                                    backgroundColor: positionColor(pos),
                                  }}
                                />
                              </div>
                              <span className="w-10 text-right text-[10px] font-mono text-text-muted shrink-0">
                                {pos > 0 ? '+' : ''}{pos.toFixed(1)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      {/* Scale labels */}
                      <div className="flex justify-between text-[9px] text-text-secondary/50 mt-0.5 ml-[calc(6rem+0.5rem)] mr-[calc(2.5rem+0.5rem)]">
                        <span>−5</span>
                        <span>0</span>
                        <span>+5</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AeroPanel>
  )
}
