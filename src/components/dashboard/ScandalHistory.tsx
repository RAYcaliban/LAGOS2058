import { AeroPanel } from '@/components/ui/AeroPanel'

interface ScandalHistoryProps {
  scandalHistory: unknown[]
}

interface ScandalEntry {
  turn: number
  type: string
  description: string
  exposure_impact: number
  cohesion_impact: number
}

export function ScandalHistory({ scandalHistory }: ScandalHistoryProps) {
  const scandals = (scandalHistory ?? []) as ScandalEntry[]

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">Scandal History</h2>
      <div className="glow-line mb-3" />

      {scandals.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No scandals recorded. Keep your exposure low to avoid them.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {scandals.slice().reverse().map((scandal, i) => (
            <div key={i} className="py-2 border-b border-bg-tertiary/20 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-text-muted">T{scandal.turn}</span>
                <span className="badge badge-danger text-[10px]">{scandal.type}</span>
              </div>
              <p className="text-sm text-text-primary">{scandal.description}</p>
              <div className="flex gap-3 text-xs text-text-muted mt-1">
                {scandal.exposure_impact !== 0 && (
                  <span>Exposure: {scandal.exposure_impact > 0 ? '+' : ''}{scandal.exposure_impact.toFixed(0)}%</span>
                )}
                {scandal.cohesion_impact !== 0 && (
                  <span className="text-danger">
                    Cohesion: {scandal.cohesion_impact > 0 ? '+' : ''}{scandal.cohesion_impact.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AeroPanel>
  )
}
