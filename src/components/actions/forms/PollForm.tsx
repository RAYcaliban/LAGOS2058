'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AZSelector } from '@/components/actions/fields/AZSelector'
import { IssueDimensionSelector } from '@/components/actions/fields/IssueDimensionSelector'
import { ZONES } from '@/lib/constants/zones'

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
  { value: '1', label: 'Tier 1 (1 PC) — State-level data' },
  { value: '2', label: 'Tier 2 (2 PC) — Zonal breakdown' },
  { value: '3', label: 'Tier 3 (3 PC) — National snapshot' },
]

const TIER_MAX_DIMENSIONS: Record<number, number> = { 1: 8, 2: 4, 3: 2 }

// Flat list of all states with their AZ for the state selector
const STATE_OPTIONS = ZONES.flatMap((z) =>
  z.states.map((s) => ({ value: s, label: `${s} (${z.key})` }))
)

export function PollForm({
  params,
  onParamsChange,
  targetAzs,
  onTargetAzsChange,
}: ActionFormProps) {
  const tier = Number(params.poll_tier ?? 1)
  const maxDimensions = TIER_MAX_DIMENSIONS[tier] ?? tier * 2
  const currentDimensions = (params.issue_dimensions ?? []) as number[]
  const selectedState = (params.poll_state as string) ?? ''

  function handleTierChange(newTier: number) {
    const newMax = TIER_MAX_DIMENSIONS[newTier] ?? newTier * 2
    const trimmed = currentDimensions.length > newMax
      ? currentDimensions.slice(0, newMax)
      : currentDimensions
    const next: Record<string, unknown> = { ...params, poll_tier: newTier, issue_dimensions: trimmed }
    // Clear scope selections when tier changes
    if (newTier !== 2) onTargetAzsChange([])
    if (newTier !== 3) delete next.poll_state
    onParamsChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        Tier 1 = pick a state (8 issues). Tier 2 = pick a zone (4 issues). Tier 3 = national snapshot (2 issues).
      </div>

      <AeroSelect
        label="Poll Tier"
        value={String(params.poll_tier ?? '')}
        onChange={(e) => handleTierChange(Number(e.target.value))}
        options={POLL_TIER_OPTIONS}
        placeholder="Select poll tier"
      />

      {/* Tier 2: Zone selector */}
      {tier === 2 && (
        <AZSelector
          value={targetAzs}
          onChange={onTargetAzsChange}
          multi={false}
          label="Poll Zone"
        />
      )}

      {/* Tier 3: State selector */}
      {tier === 3 && (
        <AeroSelect
          label="Poll State"
          value={selectedState}
          onChange={(e) => onParamsChange({ ...params, poll_state: e.target.value })}
          options={STATE_OPTIONS}
          placeholder="Select a state..."
        />
      )}

      <IssueDimensionSelector
        value={currentDimensions}
        onChange={(issue_dimensions) => onParamsChange({ ...params, issue_dimensions })}
        max={maxDimensions}
        label={`Filter by Issue Dimensions (max ${maxDimensions})`}
      />
    </div>
  )
}
