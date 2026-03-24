'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'
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
  { value: 'diaspora', label: 'Diaspora' },
  { value: 'business_elite', label: 'Business Elite' },
  { value: 'grassroots', label: 'Grassroots' },
  { value: 'membership', label: 'Membership' },
]

const SOURCE_INFO: Record<string, string> = {
  diaspora: 'Yields ~4 PC. No significant side effects.',
  business_elite: 'Yields ~5 PC. Increases exposure risk.',
  grassroots: 'Yields ~4 PC. Turnout bonus in targeted areas.',
  membership: 'Yields 2-5 PC, scales with party cohesion.',
}

export function FundraisingForm({
  params,
  onParamsChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  const source = params.source ?? ''

  return (
    <div className="space-y-4">
      <div className="rounded border border-aero-500/20 bg-aero-500/5 px-3 py-2 text-xs text-text-secondary">
        National scope. Yields PC based on source and GM quality score.
      </div>

      <AeroSelect
        label="Funding Source"
        value={source}
        onChange={(e) => onParamsChange({ ...params, source: e.target.value })}
        options={SOURCE_OPTIONS}
        placeholder="Select funding source"
      />
      {source && SOURCE_INFO[source] && (
        <p className="text-xs text-text-muted -mt-2">{SOURCE_INFO[source]}</p>
      )}

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the fundraising strategy — events, donor outreach, incentives..."
      />
    </div>
  )
}
