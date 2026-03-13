'use client'

import { AeroSelect } from '@/components/ui/AeroSelect'

// Districts are composed of states; this is a simplified version
// Full district data comes from district_info.json
const DISTRICTS = [
  { value: 'lagos-island', label: 'Lagos Island' },
  { value: 'lagos-mainland', label: 'Lagos Mainland' },
  { value: 'ikorodu', label: 'Ikorodu' },
  { value: 'ikeja', label: 'Ikeja' },
  { value: 'badagry', label: 'Badagry' },
  { value: 'epe', label: 'Epe' },
  { value: 'oshodi-isolo', label: 'Oshodi-Isolo' },
  { value: 'surulere', label: 'Surulere' },
  { value: 'mushin', label: 'Mushin' },
  { value: 'agege', label: 'Agege' },
]

interface DistrictSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function DistrictSelector({ value, onChange, error }: DistrictSelectorProps) {
  return (
    <AeroSelect
      label="Target District"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={DISTRICTS}
      placeholder="Select a district"
      error={error}
    />
  )
}
