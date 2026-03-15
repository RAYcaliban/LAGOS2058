'use client'

import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { PartySelector } from '@/components/actions/fields/PartySelector'
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

const TONE_OPTIONS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'contrast', label: 'Contrast' },
]

export function MediaForm({
  params,
  onParamsChange,
  language,
  onLanguageChange,
  description,
  onDescriptionChange,
}: ActionFormProps) {
  const headline = params.headline ?? ''
  const headlineError = headline.length > 0 && headline.length < 5
    ? 'Headline must be at least 5 characters'
    : undefined
  const tone = params.tone ?? ''
  const showTargetParty = tone === 'negative' || tone === 'contrast'

  return (
    <div className="space-y-4">
      <AeroInput
        label="Headline"
        value={headline}
        onChange={(e) => onParamsChange({ ...params, headline: e.target.value })}
        placeholder="Enter a compelling headline (min 5 chars)"
        error={headlineError}
      />

      <AeroInput
        label="Angle"
        value={params.angle ?? ''}
        onChange={(e) => onParamsChange({ ...params, angle: e.target.value })}
        placeholder="What angle or framing should the story take?"
      />

      <AeroSelect
        label="Tone"
        value={tone}
        onChange={(e) => onParamsChange({ ...params, tone: e.target.value })}
        options={TONE_OPTIONS}
        placeholder="Select tone"
      />

      {showTargetParty && (
        <PartySelector
          value={params.target_party ?? ''}
          onChange={(target_party) => onParamsChange({ ...params, target_party })}
          label="Target Party"
        />
      )}

      <LanguageSelector
        value={language}
        onChange={onLanguageChange}
      />

      <DescriptionEditor
        value={description}
        onChange={onDescriptionChange}
        placeholder="Describe the media strategy — press conference details, talking points, target outlets..."
      />
    </div>
  )
}
