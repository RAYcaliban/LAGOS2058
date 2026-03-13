'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { DistrictSelector } from '@/components/actions/fields/DistrictSelector'
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

const INTENSITY_OPTIONS = [
  { value: '0', label: 'Standard' },
  { value: '1', label: 'Reinforced (+1 PC)' },
  { value: '2', label: 'Surge (+2 PC)' },
]

export function GroundGameForm({
  params,
  onParamsChange,
  language,
  onLanguageChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <DistrictSelector
        value={params.district ?? ''}
        onChange={(district) => onParamsChange({ ...params, district })}
      />

      <AeroSelect
        label="Intensity"
        value={String(params.intensity ?? '0')}
        onChange={(e) => onParamsChange({ ...params, intensity: Number(e.target.value) })}
        options={INTENSITY_OPTIONS}
      />

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the ground game — canvassing strategy, door-to-door plan, volunteer deployment..."
      />
    </div>
  )
}
