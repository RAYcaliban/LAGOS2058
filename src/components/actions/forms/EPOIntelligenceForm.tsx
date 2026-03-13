'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
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

const CATEGORY_OPTIONS = [
  { value: 'security', label: 'Security' },
  { value: 'economic', label: 'Economic' },
  { value: 'social', label: 'Social' },
  { value: 'political', label: 'Political' },
]

export function EPOIntelligenceForm({
  params,
  onParamsChange,
  targetAzs,
  onTargetAzsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-400">
        FREE action — requires EPO score &gt;= 5 in target zone. No PC cost.
      </div>

      <AZSelector
        value={targetAzs}
        onChange={onTargetAzsChange}
        multi={false}
        label="Target Zone"
      />

      <AeroSelect
        label="Category"
        value={params.category ?? ''}
        onChange={(e) => onParamsChange({ ...params, category: e.target.value })}
        options={CATEGORY_OPTIONS}
        placeholder="Select intelligence category"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe what intelligence you want to gather — specific questions, areas of concern..."
      />
    </div>
  )
}
