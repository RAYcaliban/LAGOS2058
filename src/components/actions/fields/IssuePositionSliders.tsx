'use client'

import { ISSUES } from '@/lib/constants/issues'
import { AeroSlider } from '@/components/ui/AeroSlider'

interface Position {
  issue: number
  position: number
}

interface IssuePositionSlidersProps {
  positions: Position[]
  onChange: (positions: Position[]) => void
  scale?: { min?: number; max?: number; step?: number }
}

export function IssuePositionSliders({
  positions,
  onChange,
  scale,
}: IssuePositionSlidersProps) {
  const min = scale?.min ?? -5
  const max = scale?.max ?? 5
  const step = scale?.step ?? 0.5

  function getPosition(issueIndex: number): number {
    return positions.find((p) => p.issue === issueIndex)?.position ?? 0
  }

  function setPosition(issueIndex: number, position: number) {
    const existing = positions.filter((p) => p.issue !== issueIndex)
    if (position !== 0) {
      existing.push({ issue: issueIndex, position })
    }
    onChange(existing)
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        Issue Positions ({min} to {max})
      </label>
      <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
        {ISSUES.map((issue) => (
          <div key={issue.index} className="flex items-center gap-3">
            <span
              className="text-xs text-text-secondary w-40 shrink-0 truncate"
              title={issue.description}
            >
              {issue.label}
            </span>
            <AeroSlider
              value={getPosition(issue.index)}
              onChange={(v) => setPosition(issue.index, v)}
              min={min}
              max={max}
              step={step}
              formatValue={(v) => v.toFixed(1)}
            />
          </div>
        ))}
      </div>
      {positions.length > 0 && (
        <p className="text-xs text-text-muted">{positions.length} positions set</p>
      )}
    </div>
  )
}
