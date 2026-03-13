'use client'

import { CountdownTimer } from '@/components/ui/CountdownTimer'

interface TurnContextBarProps {
  turn: number
  deadline: string | null
  submissionOpen: boolean
  pcAvailable: number
  pcSpent: number
}

export function TurnContextBar({ turn, deadline, submissionOpen, pcAvailable, pcSpent }: TurnContextBarProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-bg-secondary border border-aero-500/10 rounded px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Turn</div>
          <div className="font-display text-xl font-bold text-aero-400">{turn}</div>
        </div>
        <div className="w-px h-8 bg-aero-500/15" />
        <div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted">Deadline</div>
          <CountdownTimer deadline={deadline} className="text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-text-muted">PC Budget</div>
          <div className="font-mono text-sm">
            <span className="text-aero-400 font-bold">{pcAvailable - pcSpent}</span>
            <span className="text-text-muted"> / {pcAvailable}</span>
          </div>
        </div>
        <div className={`text-xs font-semibold px-2 py-1 rounded ${
          submissionOpen
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-danger/10 text-danger border border-danger/20'
        }`}>
          {submissionOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>
    </div>
  )
}
