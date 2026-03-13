'use client'

interface ActionExpandedRowProps {
  action: {
    description: string
    params: Record<string, unknown>
    target_lgas: string[] | null
    target_azs: string[] | null
  }
}

export function ActionExpandedRow({ action }: ActionExpandedRowProps) {
  const paramEntries = Object.entries(action.params ?? {}).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  )

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Full Description</div>
        <p className="text-sm whitespace-pre-wrap">{action.description}</p>
      </div>

      {paramEntries.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Parameters</div>
          <div className="space-y-1">
            {paramEntries.map(([key, val]) => (
              <div key={key} className="flex gap-2 text-sm">
                <span className="text-text-muted font-mono">{key}:</span>
                <span>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {action.target_lgas && action.target_lgas.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Target LGAs</div>
          <div className="flex flex-wrap gap-1">
            {action.target_lgas.map((lga) => (
              <span key={lga} className="badge badge-info">{lga}</span>
            ))}
          </div>
        </div>
      )}

      {action.target_azs && action.target_azs.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Target AZs</div>
          <div className="flex flex-wrap gap-1">
            {action.target_azs.map((az) => (
              <span key={az} className="badge badge-info">{az}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
