'use client'

import { useState, useMemo, useEffect } from 'react'
import { ZONES } from '@/lib/constants/zones'

interface DistrictMeta {
  district_id: string
  az: number
  az_name: string
  num_lgas: number
  states: string
}

interface DistrictSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

// Module-level cache
let cachedDistricts: DistrictMeta[] | null = null

export function DistrictSelector({ value, onChange, error }: DistrictSelectorProps) {
  const [search, setSearch] = useState('')
  const [azFilter, setAzFilter] = useState<string>('')
  const [districts, setDistricts] = useState<DistrictMeta[]>(cachedDistricts ?? [])
  const [loading, setLoading] = useState(!cachedDistricts)

  useEffect(() => {
    if (cachedDistricts) return
    fetch('/geo/district_meta.json')
      .then((r) => r.json())
      .then((data: Record<string, DistrictMeta>) => {
        const arr = Object.values(data).sort((a, b) => a.district_id.localeCompare(b.district_id))
        cachedDistricts = arr
        setDistricts(arr)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let result = districts
    if (azFilter) {
      const azNum = parseInt(azFilter.replace('AZ', ''), 10)
      result = result.filter((d) => d.az === azNum)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.district_id.toLowerCase().includes(q) ||
          d.states.toLowerCase().includes(q) ||
          d.az_name.toLowerCase().includes(q),
      )
    }
    return result
  }, [districts, azFilter, search])

  // Group by AZ
  const grouped = useMemo(() => {
    const groups: Record<number, DistrictMeta[]> = {}
    for (const d of filtered) {
      if (!groups[d.az]) groups[d.az] = []
      groups[d.az].push(d)
    }
    return Object.entries(groups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([az, entries]) => ({
        az: Number(az),
        azName: entries[0].az_name,
        entries,
      }))
  }, [filtered])

  if (loading) {
    return (
      <div className="space-y-1">
        <label className="block text-xs uppercase tracking-widest text-text-secondary">
          Target District
        </label>
        <p className="text-xs text-text-muted animate-pulse">Loading 150 districts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        Target District
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
          placeholder="Search districts..."
          className="aero-input text-sm py-1.5 flex-1"
        />
      </div>

      <div className="max-h-48 overflow-y-auto bg-bg-primary/50 rounded p-2 space-y-2">
        {grouped.map((group) => (
          <div key={group.az}>
            <div className="text-xs font-semibold text-aero-400 sticky top-0 bg-bg-primary/90 py-0.5 px-1">
              AZ{group.az} — {group.azName}
            </div>
            <div className="space-y-0.5 mt-1">
              {group.entries.map((d) => {
                const isSelected = value === d.district_id
                return (
                  <button
                    key={d.district_id}
                    type="button"
                    onClick={() => onChange(d.district_id)}
                    className={`w-full text-left text-sm py-1 px-2 rounded cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-aero-500/20 text-aero-300'
                        : 'hover:bg-bg-tertiary/50 text-text-primary'
                    }`}
                  >
                    <span className="font-mono text-xs">{d.district_id}</span>
                    <span className="text-text-muted text-xs ml-2">
                      {d.az_name} ({d.states}, {d.num_lgas} LGAs)
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <p className="text-xs text-text-muted py-2 text-center">No districts match filter</p>
        )}
      </div>

      {value && (
        <p className="text-xs text-text-muted">
          Selected: <span className="font-mono">{value}</span>
        </p>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
