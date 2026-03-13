'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroSlider } from '@/components/ui/AeroSlider'
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

const CATEGORY_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'economic', label: 'Economic' },
  { value: 'social', label: 'Social' },
  { value: 'political', label: 'Political' },
]

export function EPOEngagementForm({
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
        label="Category"
        value={params.category ?? ''}
        onChange={(e) => onParamsChange({ ...params, category: e.target.value })}
        options={CATEGORY_OPTIONS}
        placeholder="Select EPO category"
      />

      <AZSelector
        value={targetAzs}
        onChange={onTargetAzsChange}
        multi={false}
        label="Target Zone"
      />

      <AeroSlider
        label="Score Change"
        value={params.score_change ?? 1}
        onChange={(score_change) => onParamsChange({ ...params, score_change })}
        min={1}
        max={5}
        step={0.5}
        formatValue={(v) => v.toFixed(1)}
      />

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the EPO engagement — outreach strategy, concessions offered, relationship building..."
      />
    </div>
  )
}
