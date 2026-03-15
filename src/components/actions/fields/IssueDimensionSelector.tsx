'use client'

import { useState, useMemo } from 'react'
import { ISSUES } from '@/lib/constants/issues'

interface IssueDimensionSelectorProps {
  value: number[]
  onChange: (value: number[]) => void
  max?: number
  label?: string
  error?: string
}

export function IssueDimensionSelector({
  value,
  onChange,
  max,
  label = 'Issue Dimensions',
  error,
}: IssueDimensionSelectorProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return [...ISSUES]
    const q = search.toLowerCase()
    return ISSUES.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    )
  }, [search])

  const atMax = max !== undefined && value.length >= max

  return (
    <div className="space-y-2">
      <label className="block text-xs uppercase tracking-widest text-text-secondary">
        {label}
      </label>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dimensions..."
        className="aero-input text-sm py-1.5"
      />

      <div className="max-h-40 overflow-y-auto bg-bg-primary/50 rounded p-2 space-y-0.5">
        {filtered.map((issue) => {
          const isSelected = value.includes(issue.index)
          const isDisabled = !isSelected && atMax
          return (
            <label
              key={issue.index}
              className={`flex items-center gap-2 text-sm py-0.5 px-1 rounded ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : isSelected
                    ? 'bg-aero-500/10 cursor-pointer'
                    : 'hover:bg-bg-tertiary/50 cursor-pointer'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {
                  if (isSelected) {
                    onChange(value.filter((v) => v !== issue.index))
                  } else if (!isDisabled) {
                    onChange([...value, issue.index])
                  }
                }}
                className="accent-aero-500"
              />
              <span className="font-mono text-xs text-text-muted w-5">{issue.index}</span>
              <span>{issue.label}</span>
              <span className="text-text-muted text-xs ml-auto truncate max-w-[200px]">
                {issue.description}
              </span>
            </label>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-text-muted py-2 text-center">No dimensions match</p>
        )}
      </div>

      <p className="text-xs text-text-muted">
        {value.length}{max ? ` / ${max}` : ''} selected
      </p>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
