'use client'

import { useState, useMemo, useEffect } from 'react'
import { ZONES } from '@/lib/constants/zones'

interface LGAEntry {
  name: string
  state: string
  district: string
  az: number
  azName: string
}

interface LGASelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

// Module-level cache
let cachedLgas: LGAEntry[] | null = null

export function LGASelector({ value, onChange, error }: LGASelectorProps) {
  const [search, setSearch] = useState('')
  const [azFilter, setAzFilter] = useState<string>('')
  const [lgas, setLgas] = useState<LGAEntry[]>(cachedLgas ?? [])
  const [loading, setLoading] = useState(!cachedLgas)

  useEffect(() => {
    if (cachedLgas) return
    fetch('/geo/lga_index.json')
      .then((r) => r.json())
      .then((data: LGAEntry[]) => {
        cachedLgas = data
        setLgas(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = lgas
    if (azFilter) {
      const azNum = parseInt(azFilter.replace('AZ', ''), 10)
      result = result.filter((l) => l.az === azNum)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) => l.name.toLowerCase().includes(q) || l.state.toLowerCase().includes(q),
      )
    }
    return result
  }, [lgas, azFilter, search])

  // Group by AZ for display
  const grouped = useMemo(() => {
    const groups: Record<number, LGAEntry[]> = {}
    for (const lga of filtered) {
      if (!groups[lga.az]) groups[lga.az] = []
      groups[lga.az].push(lga)
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([az, entries]) => ({
        az: Number(az),
        azName: entries[0].azName,
        entries,
      }))
  }, [filtered])

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-widest text-text-secondary">
          Target LGAs
        </label>
        <p className="text-xs text-text-muted animate-pulse">Loading 774 LGAs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        Target LGAs
      </label>

      <div className="flex gap-2">
        <select
          className="aero-select text-sm py-1.5 w-48"
          value={azFilter}
          onChange={(e) => setAzFilter(e.target.value)}
        >
          <option value="">All Zones</option>
          {ZONES.map((z) => (
            <option key={z.key} value={z.key}>
              {z.key} — {z.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or state..."
          className="aero-input text-sm py-1.5 flex-1"
        />
      </div>

      <div className="max-h-48 overflow-y-auto bg-bg-primary/50 rounded p-2 space-y-2">
        {grouped.map((group) => (
          <div key={group.az}>
            <div className="text-xs font-semibold text-aero-400 sticky top-0 bg-bg-primary/90 py-0.5 px-1">
              AZ{group.az} — {group.azName} ({group.entries.length})
            </div>
            <div className="space-y-0.5 mt-1">
              {group.entries.map((lga) => {
                const isSelected = value.includes(lga.name)
                return (
                  <label
                    key={`${lga.name}-${lga.state}`}
                    className={`flex items-center gap-2 text-sm py-0.5 px-1 rounded cursor-pointer ${
                      isSelected ? 'bg-aero-500/10' : 'hover:bg-bg-tertiary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          onChange(value.filter((v) => v !== lga.name))
                        } else {
                          onChange([...value, lga.name])
                        }
                      }}
                      className="accent-aero-500"
                    />
                    <span>{lga.name}</span>
                    <span className="text-text-muted text-xs">({lga.state})</span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="text-xs text-text-muted py-2 text-center">No LGAs match filter</p>
        )}
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
