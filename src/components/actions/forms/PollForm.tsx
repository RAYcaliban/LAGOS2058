'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { IssueDimensionSelector } from '@/components/actions/fields/IssueDimensionSelector'
import { DescriptionEditor } from '@/components/actions/fields/DescriptionEditor'

interface ActionFormProps {
  params: Record<string, any>
  onParamsChange: (params: Record<string, any>) => void
  targetLgas: string[]
  onTargetLgasChange: (lgas: string[]) => void
  targetAzs: string[]
  onTargetAzsChange: (azs: string[]) => void
  language: string
  onLanguageChange: (lang: string) => void
  description: string
  onDescriptionChange: (desc: string) => void
}

const POLL_TIER_OPTIONS = [
  { value: '1', label: 'Tier 1 (1 PC) — National snapshot' },
  { value: '2', label: 'Tier 2 (2 PC) — Zonal breakdown' },
  { value: '3', label: 'Tier 3 (3 PC) — State-level data' },
  { value: '4', label: 'Tier 4 (4 PC) — State fine-grained' },
  { value: '5', label: 'Tier 5 (5 PC) — LGA-level survey' },
]

export function PollForm({
  params,
  onParamsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        No language or targeting needed.
      </div>

      <AeroSelect
        label="Poll Tier"
        value={String(params.poll_tier ?? '')}
        onChange={(e) => onParamsChange({ ...params, poll_tier: Number(e.target.value) })}
        options={POLL_TIER_OPTIONS}
        placeholder="Select poll tier"
      />

      <IssueDimensionSelector
        value={params.issue_dimensions ?? []}
        onChange={(issue_dimensions) => onParamsChange({ ...params, issue_dimensions })}
        label="Filter by Issue Dimensions (optional)"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe what you want to learn from the poll — specific questions, regions of interest, issues to probe..."
      />
    </div>
  )
}
