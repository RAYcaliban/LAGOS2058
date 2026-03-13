import { AeroPanel } from '@/components/ui/AeroPanel'

interface ActionHistoryProps {
  actionHistory: unknown[]
}

interface ActionEntry {
  turn: number
  action_type: string
  description: string
  pc_cost: number
  status: string
}

export function ActionHistory({ actionHistory }: ActionHistoryProps) {
  const entries = (actionHistory ?? []) as ActionEntry[]

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">Action History</h2>
      <div className="glow-line mb-3" />

      {entries.length === 0 ? (
        <p className="text-sm text-text-secondary">No actions submitted yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {entries.slice().reverse().map((entry, i) => (
            <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-bg-tertiary/20 last:border-0">
              <span className="text-xs font-mono text-text-muted w-8 shrink-0">T{entry.turn}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{entry.action_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-aero-400 font-mono">{entry.pc_cost} PC</span>
                </div>
                {entry.description && (
                  <p className="text-xs text-text-muted truncate">{entry.description}</p>
                )}
              </div>
              <span className={`badge text-[10px] ${
                entry.status === 'processed' ? 'badge-success' :
                entry.status === 'submitted' ? 'badge-info' :
                entry.status === 'rejected' ? 'badge-danger' :
                'badge-warning'
              }`}>
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </AeroPanel>
  )
}
