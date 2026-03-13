'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'

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

export function LanguageSelector({ value, onChange, error }: LanguageSelectorProps) {
  return (
    <AeroSelect
      label="Campaign Language"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={LANGUAGE_OPTIONS}
      error={error}
    />
  )
}
