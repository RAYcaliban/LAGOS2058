'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AZSelector } from '@/components/actions/fields/AZSelector'
import { LanguageSelector } from '@/components/actions/fields/LanguageSelector'
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

const MEDIUM_OPTIONS = [
  { value: 'radio', label: 'Radio' },
  { value: 'tv', label: 'TV' },
  { value: 'internet', label: 'Internet' },
]

const BUDGET_OPTIONS = [
  { value: '0', label: 'Standard' },
  { value: '1', label: 'Heavy (+1 PC)' },
  { value: '2', label: 'Blitz (+2 PC)' },
]

export function AdvertisingForm({
  params,
  onParamsChange,
  targetAzs,
  onTargetAzsChange,
  language,
  onLanguageChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <AeroSelect
        label="Medium"
        value={params.medium ?? ''}
        onChange={(e) => onParamsChange({ ...params, medium: e.target.value })}
        options={MEDIUM_OPTIONS}
        placeholder="Select medium"
      />

      <AeroSelect
        label="Budget"
        value={String(params.budget ?? '0')}
        onChange={(e) => onParamsChange({ ...params, budget: Number(e.target.value) })}
        options={BUDGET_OPTIONS}
      />

      <AZSelector
        value={targetAzs}
        onChange={onTargetAzsChange}
      />

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the ad campaign — messaging, tone, target demographics..."
      />
    </div>
  )
}
