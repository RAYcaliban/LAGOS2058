'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroInput } from '@/components/ui/AeroInput'
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

const ENDORSER_TYPE_OPTIONS = [
  { value: 'traditional_ruler', label: 'Traditional Ruler' },
  { value: 'religious_leader', label: 'Religious Leader' },
  { value: 'epo_leader', label: 'EPO Leader' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'notable', label: 'Notable Figure' },
]

export function EndorsementForm({
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
        label="Endorser Type"
        value={params.endorser_type ?? ''}
        onChange={(e) => onParamsChange({ ...params, endorser_type: e.target.value })}
        options={ENDORSER_TYPE_OPTIONS}
        placeholder="Select endorser type"
      />

      <AeroInput
        label="Endorser Name"
        value={params.endorser_name ?? ''}
        onChange={(e) => onParamsChange({ ...params, endorser_name: e.target.value })}
        placeholder="Name of the endorser"
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
        placeholder="Describe the endorsement — context, public appearance, messaging..."
      />
    </div>
  )
}
