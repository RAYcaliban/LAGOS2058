'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { LGASelector } from '@/components/actions/fields/LGASelector'
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

const TIER_OPTIONS = [
  { value: '0', label: 'Standard' },
  { value: '1', label: 'Heavy (+1 PC)' },
  { value: '2', label: 'Massive (+2 PC)' },
]

export function PatronageForm({
  params,
  onParamsChange,
  targetLgas,
  onTargetLgasChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <AeroSelect
        label="Tier"
        value={String(params.tier ?? '0')}
        onChange={(e) => onParamsChange({ ...params, tier: Number(e.target.value) })}
        options={TIER_OPTIONS}
      />

      <LGASelector
        value={targetLgas}
        onChange={onTargetLgasChange}
      />
      <p className="text-xs text-text-muted -mt-2">
        Cost scales with the number of LGAs targeted.
      </p>

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the patronage distribution — what is being offered, to whom, through what channels..."
      />
    </div>
  )
}
