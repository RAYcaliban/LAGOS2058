'use client'

import { AeroInput } from '@/components/ui/AeroInput'
import { LGASelector } from '@/components/actions/fields/LGASelector'
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

export function CrisisResponseForm({
  params,
  onParamsChange,
  targetLgas,
  onTargetLgasChange,
  language,
  onLanguageChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <AeroInput
        label="Crisis Type"
        value={params.crisis_type ?? ''}
        onChange={(e) => onParamsChange({ ...params, crisis_type: e.target.value })}
        placeholder="Describe the crisis"
      />

      <LGASelector
        value={targetLgas}
        onChange={onTargetLgasChange}
      />

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe your crisis response plan — immediate actions, messaging, resource deployment..."
      />
    </div>
  )
}
