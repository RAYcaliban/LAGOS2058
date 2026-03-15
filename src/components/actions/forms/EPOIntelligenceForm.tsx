'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AZSelector } from '@/components/actions/fields/AZSelector'
import { IssueDimensionSelector } from '@/components/actions/fields/IssueDimensionSelector'
import { DescriptionEditor } from '@/components/actions/fields/DescriptionEditor'
import { EPO_CATEGORIES } from '@/lib/types/game'

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

const CATEGORY_OPTIONS = EPO_CATEGORIES.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}))

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
        label="EPO Category"
        value={params.category ?? ''}
        onChange={(e) => onParamsChange({ ...params, category: e.target.value })}
        options={CATEGORY_OPTIONS}
        placeholder="Select intelligence category"
      />

      <IssueDimensionSelector
        value={params.issue_dimension != null ? [params.issue_dimension] : []}
        onChange={(dims) => onParamsChange({ ...params, issue_dimension: dims[0] ?? null })}
        max={1}
        label="Issue Dimension (optional)"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe what intelligence you want to gather — specific questions, areas of concern..."
      />
    </div>
  )
}
