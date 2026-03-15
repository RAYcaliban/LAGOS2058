'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
import { AZSelector } from '@/components/actions/fields/AZSelector'
import { DescriptionEditor } from '@/components/actions/fields/DescriptionEditor'
import { EPO_CATEGORIES, EPO_SALIENCE_DIMENSIONS } from '@/lib/types/game'
import { ISSUE_BY_INDEX } from '@/lib/constants/issues'

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

export function EPOEngagementForm({
  params,
  onParamsChange,
  targetAzs,
  onTargetAzsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  const category = params.category ?? ''
  const salienceDims = category
    ? EPO_SALIENCE_DIMENSIONS[category as keyof typeof EPO_SALIENCE_DIMENSIONS]
    : null

  return (
    <div className="space-y-4">
      <AeroSelect
        label="EPO Category"
        value={category}
        onChange={(e) => onParamsChange({ ...params, category: e.target.value })}
        options={CATEGORY_OPTIONS}
        placeholder="Select EPO category"
      />

      {salienceDims && (
        <p className="text-xs text-text-muted -mt-2">
          Salient issues: {salienceDims.map((idx) => ISSUE_BY_INDEX[idx]?.label ?? `#${idx}`).join(', ')}
        </p>
      )}

      <AZSelector
        value={targetAzs}
        onChange={onTargetAzsChange}
        multi={false}
        label="Target Zone"
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the EPO engagement — outreach strategy, concessions offered, relationship building..."
      />
    </div>
  )
}
