'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { IssueDimensionSelector } from '@/components/actions/fields/IssueDimensionSelector'

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
]

const TIER_MAX_DIMENSIONS: Record<number, number> = { 1: 2, 2: 4, 3: 6 }

export function PollForm({
  params,
  onParamsChange,
}: ActionFormProps) {
  const tier = Number(params.poll_tier ?? 1)
  const maxDimensions = TIER_MAX_DIMENSIONS[tier] ?? tier * 2
  const currentDimensions = (params.issue_dimensions ?? []) as number[]

  function handleTierChange(newTier: number) {
    const newMax = TIER_MAX_DIMENSIONS[newTier] ?? newTier * 2
    const trimmed = currentDimensions.length > newMax
      ? currentDimensions.slice(0, newMax)
      : currentDimensions
    onParamsChange({ ...params, poll_tier: newTier, issue_dimensions: trimmed })
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        No language or targeting needed. Tier 1 allows 2 issue dimensions, Tier 2 allows 4, Tier 3 allows 6. Scroll down to see all 28 dimensions.
      </div>

      <AeroSelect
        label="Poll Tier"
        value={String(params.poll_tier ?? '')}
        onChange={(e) => handleTierChange(Number(e.target.value))}
        options={POLL_TIER_OPTIONS}
        placeholder="Select poll tier"
      />

      <IssueDimensionSelector
        value={currentDimensions}
        onChange={(issue_dimensions) => onParamsChange({ ...params, issue_dimensions })}
        max={maxDimensions}
        label={`Filter by Issue Dimensions (max ${maxDimensions})`}
      />
    </div>
  )
}
