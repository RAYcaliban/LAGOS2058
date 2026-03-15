'use client'

import { AeroInput } from '@/components/ui/AeroInput'
import { AZSelector } from '@/components/actions/fields/AZSelector'
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

export function EthnicMobilizationForm({
  params,
  onParamsChange,
  targetAzs,
  onTargetAzsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
        Warning: Ethnic mobilization increases exposure risk
      </div>

      <AeroInput
        label="Ethnic Group"
        value={params.ethnic_group ?? ''}
        onChange={(e) => onParamsChange({ ...params, ethnic_group: e.target.value })}
        placeholder="Target ethnic group"
      />

      <AZSelector
        value={targetAzs}
        onChange={onTargetAzsChange}
      />
      <p className="text-xs text-text-muted -mt-2">
        1-3 zones = regional. Empty = national scope.
      </p>

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the mobilization strategy — community leaders involved, messaging, events..."
      />
    </div>
  )
}
