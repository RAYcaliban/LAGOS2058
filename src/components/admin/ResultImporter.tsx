'use client'

import { useState } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'

export function ResultImporter() {
  const [jsonInput, setJsonInput] = useState('')
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleParse() {
    setError(null)
    setPreview(null)
    setSuccess(false)
    try {
      const parsed = JSON.parse(jsonInput)
      if (!parsed.turn) {
        setError('JSON must include a "turn" field')
        return
      }
      setPreview({
        turn: parsed.turn,
        has_game_state: !!parsed.game_state,
        party_state_count: parsed.party_states?.length ?? 0,
        action_update_count: parsed.action_updates?.length ?? 0,
      })
    } catch {
      setError('Invalid JSON')
    }
  }

  async function handleImport() {
    setImporting(true)
    setError(null)
    try {
      const res = await fetch('/api/results/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonInput,
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      setSuccess(true)
      setPreview(null)
      setJsonInput('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setJsonInput(ev.target?.result as string)
      setPreview(null)
      setSuccess(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
          Upload JSON file
        </label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="text-sm text-text-secondary"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
          Or paste JSON
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => { setJsonInput(e.target.value); setPreview(null); setSuccess(false) }}
          rows={10}
          className="aero-input w-full font-mono text-xs resize-y"
          placeholder='{ "turn": 1, "game_state": {...}, "party_states": [...], "action_updates": [...] }'
        />
      </div>

      <div className="flex gap-3">
        <AeroButton variant="ghost" onClick={handleParse} disabled={!jsonInput.trim()}>
          Parse & Preview
        </AeroButton>
        {preview && (
          <AeroButton onClick={handleImport} loading={importing}>
            Import
          </AeroButton>
        )}
      </div>

      {error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-success bg-success/10 border border-success/20 rounded px-3 py-2">
          Import successful!
        </div>
      )}

      {preview && (
        <div className="aero-panel p-4 space-y-2">
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Preview</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Turn: <span className="font-mono text-aero-400">{String(preview.turn)}</span></div>
            <div>Game State: <span className="font-mono">{preview.has_game_state ? 'Yes' : 'No'}</span></div>
            <div>Party States: <span className="font-mono text-aero-400">{String(preview.party_state_count)}</span></div>
            <div>Action Updates: <span className="font-mono text-aero-400">{String(preview.action_update_count)}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
