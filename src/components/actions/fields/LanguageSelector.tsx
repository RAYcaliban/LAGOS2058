'use client'

import { useState } from 'react'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { LANGUAGE_ISSUE_EMPHASIS, ISSUE_BY_INDEX } from '@/lib/constants/issues'
import type { CampaignLanguage } from '@/lib/constants/issues'

const LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'hausa', label: 'Hausa' },
  { value: 'yoruba', label: 'Yoruba' },
  { value: 'igbo', label: 'Igbo' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'pidgin', label: 'Pidgin' },
  { value: 'mandarin', label: 'Mandarin' },
]

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

function getTopEmphasis(language: string, count = 5): string[] {
  const profile = LANGUAGE_ISSUE_EMPHASIS[language as CampaignLanguage]
  if (!profile) return []
  return Object.entries(profile)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([idx]) => {
      const issue = ISSUE_BY_INDEX[Number(idx)]
      return issue?.label ?? `Issue ${idx}`
    })
}

export function LanguageSelector({ value, onChange, error }: LanguageSelectorProps) {
  const [showHints, setShowHints] = useState(false)
  const topIssues = value ? getTopEmphasis(value) : []

  return (
    <div className="space-y-1">
      <AeroSelect
        label="Campaign Language"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={LANGUAGE_OPTIONS}
        error={error}
      />
      {value && topIssues.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="text-xs text-aero-400 hover:text-aero-300 transition-colors"
          >
            {showHints ? 'Hide' : 'Show'} issue emphasis
          </button>
          {showHints && (
            <p className="text-xs text-text-muted mt-1">
              Emphasises: {topIssues.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
