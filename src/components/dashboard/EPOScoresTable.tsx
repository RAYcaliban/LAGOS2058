import { AeroPanel } from '@/components/ui/AeroPanel'
import { AZ_KEYS, ZONE_BY_KEY } from '@/lib/constants/zones'
import { EPO_CATEGORIES } from '@/lib/types/game'

interface EPOScoresTableProps {
  epoScores: Record<string, Record<string, number>>
}

function getScoreColor(score: number): string {
  if (score >= 7) return 'text-success font-bold'
  if (score >= 5) return 'text-aero-400 font-semibold'
  if (score >= 3) return 'text-text-primary'
  return 'text-text-muted'
}

function getScoreBg(score: number): string {
  if (score >= 7) return 'bg-success/10'
  if (score >= 5) return 'bg-aero-500/10'
  return ''
}

export function EPOScoresTable({ epoScores }: EPOScoresTableProps) {
  const hasData = Object.keys(epoScores).length > 0

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">EPO Scores</h2>
      <div className="glow-line mb-3" />

      {!hasData ? (
        <p className="text-sm text-text-secondary">No EPO data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-aero-500/10">
                <th className="text-left py-2 px-2 text-xs uppercase tracking-wider text-text-muted">Zone</th>
                {EPO_CATEGORIES.map((cat) => (
                  <th key={cat} className="text-center py-2 px-2 text-xs uppercase tracking-wider text-text-muted">
                    {cat.slice(0, 4)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AZ_KEYS.map((zoneKey) => {
                const zone = ZONE_BY_KEY[zoneKey]
                const zoneScores = epoScores[zoneKey] ?? {}
                return (
                  <tr key={zoneKey} className="border-b border-bg-tertiary/30">
                    <td className="py-1.5 px-2 font-medium text-text-secondary" title={zone.name}>
                      {zoneKey}
                    </td>
                    {EPO_CATEGORIES.map((cat) => {
                      const score = zoneScores[cat] ?? 0
                      return (
                        <td
                          key={cat}
                          className={`py-1.5 px-2 text-center font-mono ${getScoreColor(score)} ${getScoreBg(score)}`}
                        >
                          {score.toFixed(1)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AeroPanel>
  )
}
