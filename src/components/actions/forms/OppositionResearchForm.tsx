'use client'

import { PartySelector } from '@/components/actions/fields/PartySelector'
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
  partyId?: string
}

export function OppositionResearchForm({
  params,
  onParamsChange,
  description,
  onDescriptionChange,
  partyId,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        National scope — no targeting needed
      </div>

      <PartySelector
        value={params.target_party ?? ''}
        onChange={(target_party) => onParamsChange({ ...params, target_party })}
        excludePartyId={partyId}
      />

      <IssueDimensionSelector
        value={params.target_dimensions ?? []}
        onChange={(target_dimensions) => onParamsChange({ ...params, target_dimensions })}
        max={4}
        label="Target Dimensions (up to 4)"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the opposition research focus — what vulnerabilities to investigate, sources to pursue..."
      />
    </div>
  )
}
