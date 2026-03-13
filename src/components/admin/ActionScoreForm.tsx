'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'

interface ActionScoreFormProps {
  action: {
    quality_score: number | null
    gm_notes: string | null
    status: string
  }
  onScore: (fields: { status?: string; quality_score?: number; gm_notes?: string }) => Promise<void>
}

function ScoreButtonGroup({
  label,
  value,
  onChange,
  max = 5,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  max?: number
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded text-sm font-bold transition-colors ${
              value === n
                ? 'bg-aero-600 text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-quaternary'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ActionScoreForm({ action, onScore }: ActionScoreFormProps) {
  const [strategicFit, setStrategicFit] = useState(0)
  const [quality, setQuality] = useState(0)
  const [hasContent, setHasContent] = useState(false)
  const [hasVisualAudio, setHasVisualAudio] = useState(false)
  const [hasStrategicDocs, setHasStrategicDocs] = useState(false)
  const [gmNotes, setGmNotes] = useState(action.gm_notes ?? '')
  const [loading, setLoading] = useState(false)

  const creativityCount = [hasContent, hasVisualAudio, hasStrategicDocs].filter(Boolean).length
  const totalScore = Math.min(strategicFit + quality + creativityCount, 10)

  async function handleAction(status: string) {
    setLoading(true)
    await onScore({
      status,
      quality_score: totalScore,
      gm_notes: gmNotes || undefined,
    })
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-widest text-text-secondary">Scoring</div>

      <ScoreButtonGroup label="Strategic Fit" value={strategicFit} onChange={setStrategicFit} />
      <ScoreButtonGroup label="Quality" value={quality} onChange={setQuality} />

      <div>
        <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Creativity Bonus</div>
        <div className="space-y-1">
          {[
            { label: 'Has written content', checked: hasContent, onChange: setHasContent },
            { label: 'Has visual/audio', checked: hasVisualAudio, onChange: setHasVisualAudio },
            { label: 'Has strategic docs', checked: hasStrategicDocs, onChange: setHasStrategicDocs },
          ].map(({ label, checked, onChange }) => (
            <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="rounded border-aero-700"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="aero-panel p-3 text-center">
        <div className="text-xs text-text-secondary">Quality Score</div>
        <div className="text-3xl font-display font-bold text-aero-400">{totalScore}/10</div>
        <div className="text-xs text-text-muted">
          {strategicFit} fit + {quality} quality + {creativityCount} creativity
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">GM Notes</label>
        <textarea
          value={gmNotes}
          onChange={(e) => setGmNotes(e.target.value)}
          rows={2}
          className="aero-input w-full resize-y"
          placeholder="Optional feedback for the party..."
        />
      </div>

      <div className="flex gap-2">
        <AeroButton
          onClick={() => handleAction('processed')}
          loading={loading}
          disabled={strategicFit === 0 || quality === 0}
        >
          Approve
        </AeroButton>
        <AeroButton
          variant="danger"
          onClick={() => handleAction('rejected')}
          loading={loading}
        >
          Reject
        </AeroButton>
      </div>

      {action.status !== 'submitted' && (
        <div className="text-xs text-text-muted">
          Already {action.status}. Previous score: {action.quality_score ?? 'none'}
        </div>
      )}
    </div>
  )
}
