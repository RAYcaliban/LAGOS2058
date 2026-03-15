'use client'

import { ZONES } from '@/lib/constants/zones'

interface AZSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  multi?: boolean
  label?: string
  error?: string
}

export function AZSelector({ value, onChange, multi = true, label = 'Target Zones', error }: AZSelectorProps) {
  if (!multi) {
    return (
      <div className="space-y-1">
        <label className="block text-xs uppercase tracking-widest text-text-secondary">{label}</label>
        <select
          className="aero-select"
          value={value[0] ?? ''}
          onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        >
          <option value="">Select a zone</option>
          {ZONES.map((z) => (
            <option key={z.key} value={z.key}>
              {z.key} — {z.name}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">{label}</label>
      <div className="flex flex-wrap gap-2">
        {ZONES.map((zone) => {
          const isSelected = value.includes(zone.key)
          return (
            <button
              key={zone.key}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onChange(value.filter((v) => v !== zone.key))
                } else {
                  onChange([...value, zone.key])
                }
              }}
              className={`px-3 py-1 text-xs rounded transition-all ${
                isSelected
                  ? 'bg-aero-500 text-white'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
              }`}
              title={zone.name}
            >
              {zone.key}
            </button>
          )
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-text-muted">No zones selected = national scope</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
