'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
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

const SOURCE_OPTIONS = [
  { value: 'domestic', label: 'Domestic' },
  { value: 'diaspora', label: 'Diaspora' },
  { value: 'corporate', label: 'Corporate' },
]

export function FundraisingForm({
  params,
  onParamsChange,
  language,
  onLanguageChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        National scope. Yields PC based on GM quality score.
      </div>

      <AeroSelect
        label="Source"
        value={params.source ?? ''}
        onChange={(e) => onParamsChange({ ...params, source: e.target.value })}
        options={SOURCE_OPTIONS}
        placeholder="Select funding source"
      />

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the fundraising strategy — events, donor outreach, incentives..."
      />
    </div>
  )
}
