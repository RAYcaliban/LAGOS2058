'use client'

import { useState } from 'react'
import { ISSUES } from '@/lib/constants/issues'
import { AeroSlider } from '@/components/ui/AeroSlider'
import { AeroButton } from '@/components/ui/AeroButton'

interface PartyPositionsEditorProps {
  partyId: string
  partyName: string
  initialPositions: number[] | null
  onSave: (partyId: string, positions: number[]) => void
  onClose: () => void
}

export function PartyPositionsEditor({
  partyId,
  partyName,
  initialPositions,
  onSave,
  onClose,
}: PartyPositionsEditorProps) {
  const [positions, setPositions] = useState<number[]>(
    initialPositions ?? new Array(28).fill(0),
  )
  const [saving, setSaving] = useState(false)

  function setPosition(index: number, value: number) {
    const next = [...positions]
    next[index] = value
    setPositions(next)
  }

  async function handleSave() {
    setSaving(true)
    await onSave(partyId, positions)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-aero-500/20 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-aero-500/10">
          <h3 className="naira-header text-lg">
            Set Positions — {partyName}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {ISSUES.map((issue) => (
            <div key={issue.index} className="flex items-center gap-3">
              <span
                className="text-xs text-text-secondary w-36 shrink-0 truncate"
                title={issue.description}
              >
                {issue.label}
              </span>
              <AeroSlider
                value={positions[issue.index]}
                onChange={(v) => setPosition(issue.index, v)}
                min={-5}
                max={5}
                step={0.5}
                formatValue={(v) => v.toFixed(1)}
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-aero-500/10 flex justify-end gap-3">
          <AeroButton variant="ghost" onClick={onClose}>
            Cancel
          </AeroButton>
          <AeroButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Positions'}
          </AeroButton>
        </div>
      </div>
    </div>
  )
}
