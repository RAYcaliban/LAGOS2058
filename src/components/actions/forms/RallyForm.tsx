'use client'

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

export function RallyForm({
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

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the rally — theme, key speakers, target audience..."
      />
    </div>
  )
}
