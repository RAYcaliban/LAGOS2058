'use client'

import { useState, useMemo } from 'react'

interface LGASelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

// Simplified — in production, this would load from district_info.json or Supabase
const SAMPLE_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
  'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere',
]

export function LGASelector({ value, onChange, error }: LGASelectorProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return SAMPLE_LGAS
    const q = search.toLowerCase()
    return SAMPLE_LGAS.filter((lga) => lga.toLowerCase().includes(q))
  }, [search])

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        Target LGAs
      </label>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search LGAs..."
        className="aero-input text-sm py-1.5"
      />

      <div className="max-h-40 overflow-y-auto bg-bg-primary/50 rounded p-2 space-y-1">
        {filtered.map((lga) => {
          const isSelected = value.includes(lga)
          return (
            <label
              key={lga}
              className={`flex items-center gap-2 text-sm py-0.5 px-1 rounded cursor-pointer ${
                isSelected ? 'bg-aero-500/10' : 'hover:bg-bg-tertiary/50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (isSelected) {
                    onChange(value.filter((v) => v !== lga))
                  } else {
                    onChange([...value, lga])
                  }
                }}
                className="accent-aero-500"
              />
              {lga}
            </label>
          )
        })}
      </div>

      {value.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{value.length} selected</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-aero-400 hover:text-aero-300"
          >
            Clear
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
