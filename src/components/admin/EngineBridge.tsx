'use client'

import { useState, useEffect, useCallback } from 'react'
import { AeroButton } from '@/components/ui/AeroButton'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'

interface GameState {
  turn: number
  phase: string
  submission_open: boolean
}

interface Party {
  id: string
  name: string
  color: string
}

interface ExportPayload {
  turn: number
  actions: ExportAction[]
  crises: unknown[]
}

interface ExportAction {
  party: string
  action_type: string
  target_lgas: number[] | null
  target_azs: number[] | null
  language: string
  description: string
  gm_score: number | null
  site_action_id: string
}

interface AdvanceResult {
  success: boolean
  turn: number
  actions_exported: number
  parties_updated: number
  actions_processed: number
  engine_result: Record<string, unknown>
  error?: string
}

interface SimulateResult {
  success: boolean
  simulated: boolean
  turn: number
  actions_exported: number
  engine_result: Record<string, unknown>
  error?: string
}

type Step = 'idle' | 'exporting' | 'exported' | 'running' | 'complete' | 'error'

export function EngineBridge() {
  const { data: gs, refetch: refetchGs } = useAdminFetch<GameState>('/api/admin/game-state')
  const { data: partiesData } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')

  const [turn, setTurn] = useState<string>('')
  const [engineUrl, setEngineUrl] = useState('http://localhost:8000')
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  // Export state
  const [exportData, setExportData] = useState<ExportPayload | null>(null)

  // Advance (one-click) result state
  const [advanceResult, setAdvanceResult] = useState<AdvanceResult | null>(null)

  // Simulate (dry-run) state
  const [simulateResult, setSimulateResult] = useState<SimulateResult | null>(null)
  const [simulating, setSimulating] = useState(false)

  // Rollback state
  const [rollingBack, setRollingBack] = useState(false)
  const [rollbackMsg, setRollbackMsg] = useState<string | null>(null)

  // Results release state
  const [resultsReleased, setResultsReleased] = useState(false)
  const [revealLoading, setRevealLoading] = useState(false)

  const fetchResultsStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bridge/reveal-results')
      if (res.ok) {
        const data = await res.json()
        setResultsReleased(data.results_released)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchResultsStatus() }, [fetchResultsStatus])

  // Engine health
  const [engineStatus, setEngineStatus] = useState<'unknown' | 'checking' | 'online' | 'offline'>('unknown')

  // Engine setup
  const [setupLoading, setSetupLoading] = useState<string | null>(null)
  const [setupMsg, setSetupMsg] = useState<string | null>(null)
  const [engineCampaign, setEngineCampaign] = useState<{ turn: number; phase: string } | null>(null)

  const activeTurn = turn || String(gs?.turn ?? '')

  // ── Check engine health ────────────────────────────────────────────

  async function checkEngine() {
    setEngineStatus('checking')
    try {
      const res = await fetch('/api/bridge/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine_url: engineUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setEngineStatus(data.online ? 'online' : 'offline')
        if (data.online && data.turn != null) {
          setEngineCampaign({ turn: data.turn, phase: data.phase ?? '' })
        } else {
          setEngineCampaign(null)
        }
      } else {
        setEngineStatus('offline')
        setEngineCampaign(null)
      }
    } catch {
      setEngineStatus('offline')
      setEngineCampaign(null)
    }
  }

  // ── Sync parties to engine ───────────────────────────────────────────

  async function handleSyncParties() {
    setSetupLoading('sync')
    setSetupMsg(null)
    try {
      const res = await fetch('/api/bridge/sync-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine_url: engineUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setSetupMsg(`Synced ${data.synced} parties: ${data.parties.join(', ')}`)
    } catch (err) {
      setSetupMsg(`Error: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSetupLoading(null)
    }
  }

  // ── Create new campaign in engine ────────────────────────────────────

  async function handleNewCampaign() {
    setSetupLoading('campaign')
    setSetupMsg(null)
    try {
      const res = await fetch(`${engineUrl}/api/campaign/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_turns: 8, n_monte_carlo: 3 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
      setSetupMsg(`Campaign created: Turn ${data.turn}, Phase "${data.phase}", ${data.party_statuses?.length ?? 0} parties`)
      setEngineCampaign({ turn: data.turn, phase: data.phase })
    } catch (err) {
      setSetupMsg(`Error: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSetupLoading(null)
    }
  }

  // ── Step 1: Export actions ─────────────────────────────────────────

  async function handleExport() {
    setStep('exporting')
    setError(null)
    setExportData(null)
    try {
      const res = await fetch(`/api/bridge/export?turn=${activeTurn}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const data: ExportPayload = await res.json()
      setExportData(data)
      setStep('exported')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      setStep('error')
    }
  }

  // ── Download export as file ────────────────────────────────────────

  function handleDownload() {
    if (!exportData) return
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bridge-export-turn-${activeTurn}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── One-click advance ──────────────────────────────────────────────

  async function handleAdvance() {
    setStep('running')
    setError(null)
    setAdvanceResult(null)
    try {
      const res = await fetch(`/api/bridge/advance?turn=${activeTurn}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setAdvanceResult(data)
      setStep('complete')
      refetchGs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Engine advance failed')
      setStep('error')
    }
  }

  // ── Simulate (dry-run) ───────────────────────────────────────────────

  async function handleSimulate() {
    setSimulating(true)
    setSimulateResult(null)
    setError(null)
    try {
      const res = await fetch(`/api/bridge/simulate?turn=${activeTurn}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setSimulateResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setSimulating(false)
    }
  }

  // ── Rollback turn ────────────────────────────────────────────────────

  async function handleRollback() {
    if (!confirm(`Rollback turn ${activeTurn}? This will:\n• Reset processed actions back to submitted\n• Delete party_state rows for this turn\n• Clear election results from game_state\n\nParties themselves are NOT affected.`)) {
      return
    }
    setRollingBack(true)
    setRollbackMsg(null)
    try {
      const res = await fetch(`/api/bridge/rollback?turn=${activeTurn}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setRollbackMsg(
        `Rolled back turn ${data.turn}: ${data.actions_reset} actions reset, ` +
        `${data.party_states_deleted} party states deleted, game_state cleared`
      )
      refetchGs()
    } catch (err) {
      setRollbackMsg(`Error: ${err instanceof Error ? err.message : err}`)
    } finally {
      setRollingBack(false)
    }
  }

  // ── Reveal / hide election results ──────────────────────────────────

  async function handleToggleResults() {
    const newValue = !resultsReleased
    const action = newValue ? 'reveal election results to all players' : 'hide election results from players'
    if (!confirm(`Are you sure you want to ${action}?`)) return

    setRevealLoading(true)
    try {
      const res = await fetch('/api/bridge/reveal-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ released: newValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setResultsReleased(data.results_released)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle results')
    } finally {
      setRevealLoading(false)
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────

  function handleReset() {
    setStep('idle')
    setError(null)
    setExportData(null)
    setAdvanceResult(null)
    setSimulateResult(null)
  }

  // ── Render helpers ─────────────────────────────────────────────────

  const partyCount = partiesData?.parties?.length ?? 0

  const engineStatusBadge = {
    unknown: { label: 'Unknown', cls: 'text-text-secondary' },
    checking: { label: 'Checking...', cls: 'text-amber-400 animate-pulse' },
    online: { label: 'Online', cls: 'text-success' },
    offline: { label: 'Offline', cls: 'text-danger' },
  }[engineStatus]

  return (
    <div className="space-y-6">
      {/* ── Engine Connection ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-widest text-text-secondary">Engine Connection</div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
              Engine URL
            </label>
            <input
              type="text"
              value={engineUrl}
              onChange={(e) => { setEngineUrl(e.target.value); setEngineStatus('unknown') }}
              className="aero-input w-full font-mono text-sm"
              placeholder="http://localhost:8000"
            />
          </div>
          <AeroButton variant="ghost" onClick={checkEngine} loading={engineStatus === 'checking'}>
            Test
          </AeroButton>
          <div className={`text-sm font-mono pb-2 ${engineStatusBadge.cls}`}>
            {engineStatusBadge.label}
          </div>
        </div>
      </div>

      {/* ── Engine Setup ──────────────────────────────────────────── */}
      {engineStatus === 'online' && (
        <div className="space-y-3 border-t border-aero-900/40 pt-4">
          <div className="text-xs uppercase tracking-widest text-text-secondary">Engine Setup</div>
          <div className="flex items-center gap-3 flex-wrap">
            <AeroButton variant="ghost" onClick={handleSyncParties} loading={setupLoading === 'sync'}>
              Sync Parties to Engine
            </AeroButton>
            <AeroButton variant="ghost" onClick={handleNewCampaign} loading={setupLoading === 'campaign'}>
              {engineCampaign ? 'Reset Campaign' : 'Create Campaign'}
            </AeroButton>
            {engineCampaign && (
              <span className="text-xs font-mono text-aero-400">
                Engine: Turn {engineCampaign.turn} / {engineCampaign.phase}
              </span>
            )}
            {!engineCampaign && engineStatus === 'online' && (
              <span className="text-xs text-amber-400">No active campaign — sync parties then create one</span>
            )}
          </div>
          {setupMsg && (
            <div className={`text-xs font-mono px-3 py-2 rounded border ${
              setupMsg.startsWith('Error')
                ? 'text-danger bg-danger/10 border-danger/20'
                : 'text-aero-400 bg-aero-900/20 border-aero-500/20'
            }`}>
              {setupMsg}
            </div>
          )}
        </div>
      )}

      {/* ── Turn & Status ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-text-secondary mb-1">
            Turn
          </label>
          <input
            type="number"
            value={activeTurn}
            onChange={(e) => setTurn(e.target.value)}
            className="aero-input w-full"
            min={1}
          />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Phase</div>
          <div className="text-sm font-mono text-aero-400 pt-2">{gs?.phase ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Submissions</div>
          <div className={`text-sm font-mono pt-2 ${gs?.submission_open ? 'text-success' : 'text-danger'}`}>
            {gs?.submission_open ? 'OPEN' : 'CLOSED'}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-text-secondary mb-1">Parties</div>
          <div className="text-sm font-mono text-aero-400 pt-2">{partyCount}</div>
        </div>
      </div>

      {/* ── Workflow ───────────────────────────────────────────────── */}
      <div className="border-t border-aero-900/40 pt-4 space-y-4">
        <div className="text-xs uppercase tracking-widest text-text-secondary">
          Engine Workflow
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <StepBadge label="1 Export" active={step === 'exporting'} done={step === 'exported' || step === 'running' || step === 'complete'} />
          <span className="text-text-secondary">→</span>
          <StepBadge label="2 Engine" active={step === 'running'} done={step === 'complete'} />
          <span className="text-text-secondary">→</span>
          <StepBadge label="3 Import" active={false} done={step === 'complete'} />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {step === 'idle' && (
            <>
              <AeroButton onClick={handleExport}>
                Export Actions
              </AeroButton>
              <AeroButton variant="ghost" onClick={handleSimulate} loading={simulating}>
                {simulating ? 'Simulating...' : 'Simulate Turn'}
              </AeroButton>
              <AeroButton variant="primary" onClick={handleAdvance}>
                Run Full Turn
              </AeroButton>
            </>
          )}

          {step === 'exporting' && (
            <AeroButton loading>Exporting...</AeroButton>
          )}

          {step === 'exported' && exportData && (
            <>
              <AeroButton variant="ghost" onClick={handleDownload}>
                Download JSON
              </AeroButton>
              <AeroButton onClick={handleAdvance}>
                Send to Engine & Import
              </AeroButton>
              <AeroButton variant="ghost" onClick={handleReset}>
                Reset
              </AeroButton>
            </>
          )}

          {step === 'running' && (
            <AeroButton loading>Running engine...</AeroButton>
          )}

          {step === 'complete' && (
            <AeroButton variant="ghost" onClick={handleReset}>
              Reset
            </AeroButton>
          )}

          {step === 'error' && (
            <AeroButton variant="ghost" onClick={handleReset}>
              Reset
            </AeroButton>
          )}
        </div>
      </div>

      {/* ── Admin Controls ─────────────────────────────────────────── */}
      <div className="border-t border-aero-900/40 pt-4 space-y-3">
        <div className="text-xs uppercase tracking-widest text-text-secondary">Admin Controls</div>
        <div className="flex flex-wrap items-center gap-3">
          <AeroButton variant="ghost" onClick={handleRollback} loading={rollingBack}>
            Rollback Turn {activeTurn}
          </AeroButton>
          <AeroButton
            variant={resultsReleased ? 'primary' : 'ghost'}
            onClick={handleToggleResults}
            loading={revealLoading}
          >
            {resultsReleased ? 'Hide Election Results' : 'Reveal Election Results to Players'}
          </AeroButton>
          <span className={`text-xs font-mono ${resultsReleased ? 'text-success' : 'text-text-secondary'}`}>
            Election results: {resultsReleased ? 'VISIBLE' : 'HIDDEN'}
          </span>
        </div>
        {rollbackMsg && (
          <div className={`text-xs font-mono px-3 py-2 rounded border ${
            rollbackMsg.startsWith('Error')
              ? 'text-danger bg-danger/10 border-danger/20'
              : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
          }`}>
            {rollbackMsg}
          </div>
        )}
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="text-sm text-danger bg-danger/10 border border-danger/20 rounded px-3 py-2 font-mono whitespace-pre-wrap">
          {error}
        </div>
      )}

      {/* ── Export Preview ────────────────────────────────────────── */}
      {exportData && step !== 'complete' && (
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-text-secondary">
            Export Preview — {exportData.actions.length} action{exportData.actions.length !== 1 ? 's' : ''}
          </div>
          <div className="max-h-64 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-text-secondary border-b border-aero-900/30">
                  <th className="py-1.5 pr-3">Party</th>
                  <th className="py-1.5 pr-3">Type</th>
                  <th className="py-1.5 pr-3">Language</th>
                  <th className="py-1.5 pr-3">Targets</th>
                  <th className="py-1.5 pr-3">GM Score</th>
                </tr>
              </thead>
              <tbody>
                {exportData.actions.map((a, i) => (
                  <tr key={i} className="border-b border-aero-900/20">
                    <td className="py-1.5 pr-3 font-mono text-aero-400">{a.party}</td>
                    <td className="py-1.5 pr-3 font-mono">{a.action_type}</td>
                    <td className="py-1.5 pr-3">{a.language}</td>
                    <td className="py-1.5 pr-3 font-mono text-text-secondary">
                      {a.target_lgas ? `${a.target_lgas.length} LGA` : ''}
                      {a.target_azs ? `${a.target_azs.length} AZ` : ''}
                      {!a.target_lgas && !a.target_azs ? '—' : ''}
                    </td>
                    <td className="py-1.5 pr-3 font-mono">{a.gm_score ?? '—'}</td>
                  </tr>
                ))}
                {exportData.actions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-text-secondary">
                      No submitted actions for turn {activeTurn}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Simulation Results (amber) ──────────────────────────── */}
      {simulateResult && (
        <div className="space-y-4">
          <div className="text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-3 py-2 flex items-center justify-between">
            <span>SIMULATION — no changes applied (Turn {simulateResult.turn}, {simulateResult.actions_exported} actions)</span>
            <button
              onClick={() => setSimulateResult(null)}
              className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors ml-4 shrink-0"
            >
              Dismiss
            </button>
          </div>

          {simulateResult.engine_result && (
            <EngineResultSummary result={simulateResult.engine_result} />
          )}

          <details className="group">
            <summary className="text-xs uppercase tracking-widest text-text-secondary cursor-pointer hover:text-aero-400 transition-colors">
              Raw Simulation Output
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs font-mono text-text-secondary bg-bg-secondary/50 rounded p-3 border border-aero-900/20">
              {JSON.stringify(simulateResult.engine_result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────── */}
      {advanceResult && step === 'complete' && (
        <div className="space-y-4">
          <div className="text-sm text-success bg-success/10 border border-success/20 rounded px-3 py-2">
            Turn {advanceResult.turn} processed successfully
          </div>

          <div className="grid grid-cols-3 gap-4">
            <ResultStat label="Actions Exported" value={advanceResult.actions_exported} />
            <ResultStat label="Parties Updated" value={advanceResult.parties_updated} />
            <ResultStat label="Actions Processed" value={advanceResult.actions_processed} />
          </div>

          {/* Engine result summary */}
          {advanceResult.engine_result && (
            <EngineResultSummary result={advanceResult.engine_result} />
          )}

          {/* Raw JSON collapsible */}
          <details className="group">
            <summary className="text-xs uppercase tracking-widest text-text-secondary cursor-pointer hover:text-aero-400 transition-colors">
              Raw Engine Output
            </summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs font-mono text-text-secondary bg-bg-secondary/50 rounded p-3 border border-aero-900/20">
              {JSON.stringify(advanceResult.engine_result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────

function StepBadge({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  const cls = done
    ? 'bg-success/20 text-success border-success/30'
    : active
      ? 'bg-aero-900/40 text-aero-400 border-aero-500/30 animate-pulse'
      : 'bg-bg-secondary/50 text-text-secondary border-aero-900/20'
  return (
    <span className={`px-2 py-0.5 rounded border ${cls}`}>
      {done ? '✓ ' : ''}{label}
    </span>
  )
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="aero-panel p-3 text-center">
      <div className="text-2xl font-display font-bold text-aero-400">{value}</div>
      <div className="text-xs uppercase tracking-widest text-text-secondary mt-1">{label}</div>
    </div>
  )
}

function EngineResultSummary({ result }: { result: Record<string, unknown> }) {
  const voteShares = result.national_vote_shares as Record<string, number> | undefined
  const seatCounts = result.seat_counts as Record<string, number> | undefined
  const turnout = result.national_turnout as number | undefined

  if (!voteShares) return null

  const parties = Object.entries(voteShares).sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-widest text-text-secondary">
        National Results
        {turnout != null && (
          <span className="ml-3 font-mono text-aero-400">
            Turnout: {(turnout * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="max-h-48 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-text-secondary border-b border-aero-900/30">
              <th className="py-1.5 pr-3">Party</th>
              <th className="py-1.5 pr-3 text-right">Vote Share</th>
              <th className="py-1.5 pr-3 text-right">Seats</th>
            </tr>
          </thead>
          <tbody>
            {parties.map(([name, share]) => (
              <tr key={name} className="border-b border-aero-900/20">
                <td className="py-1.5 pr-3 font-mono text-aero-400">{name}</td>
                <td className="py-1.5 pr-3 text-right font-mono">
                  {(share * 100).toFixed(1)}%
                </td>
                <td className="py-1.5 pr-3 text-right font-mono">
                  {seatCounts?.[name] != null ? Math.round(seatCounts[name]) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
