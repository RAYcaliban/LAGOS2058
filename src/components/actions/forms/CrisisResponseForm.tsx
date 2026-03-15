'use client'

import { AeroInput } from '@/components/ui/AeroInput'
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
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        National scope — crisis response applies nationally.
      </div>

      <AeroInput
        label="Crisis Type"
        value={params.crisis_type ?? ''}
        onChange={(e) => onParamsChange({ ...params, crisis_type: e.target.value })}
        placeholder="Describe the crisis"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe your crisis response plan — immediate actions, messaging, resource deployment..."
      />
    </div>
  )
}
