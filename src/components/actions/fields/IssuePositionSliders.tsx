'use client'

import { AeroSlider } from '@/components/ui/AeroSlider'

// Simplified issue list — in production, import from constants/issues.ts
const ISSUES = [
  { index: 0, label: 'Sharia Jurisdiction' },
  { index: 1, label: 'Fiscal Autonomy' },
  { index: 2, label: 'Security Reform' },
  { index: 3, label: 'Chinese Relations' },
  { index: 4, label: 'BIC Reform' },
  { index: 5, label: 'Fertility Policy' },
  { index: 6, label: 'Drug Policy' },
  { index: 7, label: 'Constitutional Structure' },
  { index: 8, label: 'Resource Revenue' },
  { index: 9, label: 'Housing' },
  { index: 10, label: 'Education' },
  { index: 11, label: 'Labor & Automation' },
  { index: 12, label: 'Military Role' },
  { index: 13, label: 'Immigration' },
  { index: 14, label: 'Language Policy' },
  { index: 15, label: 'Traditional Authority' },
  { index: 16, label: 'Infrastructure' },
  { index: 17, label: 'Land Tenure' },
  { index: 18, label: 'Corruption' },
  { index: 19, label: 'Taxation' },
  { index: 20, label: 'Agricultural Policy' },
  { index: 21, label: 'Biological Enhancement' },
  { index: 22, label: 'Trade Policy' },
  { index: 23, label: 'Environmental Regulation' },
  { index: 24, label: 'Media Freedom' },
  { index: 25, label: 'Healthcare' },
  { index: 26, label: 'PADA Status' },
  { index: 27, label: 'AZ Restructuring' },
]

interface Position {
  issue: number
  position: number
}

interface IssuePositionSlidersProps {
  positions: Position[]
  onChange: (positions: Position[]) => void
}

export function IssuePositionSliders({ positions, onChange }: IssuePositionSlidersProps) {
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
        Issue Positions (-1 to +1)
      </label>
      <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
        {ISSUES.map((issue) => (
          <div key={issue.index} className="flex items-center gap-3">
            <span className="text-xs text-text-secondary w-40 shrink-0 truncate">
              {issue.label}
            </span>
            <AeroSlider
              value={getPosition(issue.index)}
              onChange={(v) => setPosition(issue.index, v)}
              min={-1}
              max={1}
              step={0.1}
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
