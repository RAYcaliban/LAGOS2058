'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { PollResults } from '@/components/dashboard/PollResults'
import { useAdminFetch } from '@/lib/hooks/useAdminFetch'
import type { ActionFormProps } from '@/components/actions/ActionBuilder'

// Form imports (same registry as ActionBuilder)
import { RallyForm } from '@/components/actions/forms/RallyForm'
import { AdvertisingForm } from '@/components/actions/forms/AdvertisingForm'
import { GroundGameForm } from '@/components/actions/forms/GroundGameForm'
import { MediaForm } from '@/components/actions/forms/MediaForm'
import { EndorsementForm } from '@/components/actions/forms/EndorsementForm'
import { PatronageForm } from '@/components/actions/forms/PatronageForm'
import { EthnicMobilizationForm } from '@/components/actions/forms/EthnicMobilizationForm'
import { EPOEngagementForm } from '@/components/actions/forms/EPOEngagementForm'
import { OppositionResearchForm } from '@/components/actions/forms/OppositionResearchForm'
import { CrisisResponseForm } from '@/components/actions/forms/CrisisResponseForm'
import { ManifestoForm } from '@/components/actions/forms/ManifestoForm'
import { FundraisingForm } from '@/components/actions/forms/FundraisingForm'
import { PollForm } from '@/components/actions/forms/PollForm'
import { EPOIntelligenceForm } from '@/components/actions/forms/EPOIntelligenceForm'

const FORM_COMPONENTS: Record<string, React.ComponentType<ActionFormProps>> = {
  rally: RallyForm,
  advertising: AdvertisingForm,
  ground_game: GroundGameForm,
  media: MediaForm,
  endorsement: EndorsementForm,
  patronage: PatronageForm,
  ethnic_mobilization: EthnicMobilizationForm,
  epo_engagement: EPOEngagementForm,
  opposition_research: OppositionResearchForm,
  crisis_response: CrisisResponseForm,
  manifesto: ManifestoForm,
  fundraising: FundraisingForm,
  poll: PollForm,
  epo_intelligence: EPOIntelligenceForm,
}

const ACTION_OPTIONS = [
  { value: 'rally', label: 'Rally' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'ground_game', label: 'Ground Game' },
  { value: 'media', label: 'Media' },
  { value: 'endorsement', label: 'Endorsement' },
  { value: 'patronage', label: 'Patronage' },
  { value: 'ethnic_mobilization', label: 'Ethnic Mobilization' },
  { value: 'epo_engagement', label: 'EPO Engagement' },
  { value: 'opposition_research', label: 'Opposition Research' },
  { value: 'crisis_response', label: 'Crisis Response' },
  { value: 'manifesto', label: 'Manifesto' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'poll', label: 'Poll' },
  { value: 'epo_intelligence', label: 'EPO Intelligence' },
]

interface Party {
  id: string
  name: string
}

type EngineStatus = 'checking' | 'ready' | 'no-campaign' | 'offline'

export function ActionSandbox() {
  const { data: partiesData } = useAdminFetch<{ parties: Party[] }>('/api/admin/parties')

  // Engine state
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('checking')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const checkEngine = useCallback(async () => {
    setEngineStatus('checking')
    try {
      const res = await fetch('/api/bridge/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) { setEngineStatus('offline'); return }
      const data = await res.json()
      if (!data.online) { setEngineStatus('offline'); return }
      setEngineStatus(data.turn != null ? 'ready' : 'no-campaign')
    } catch {
      setEngineStatus('offline')
    }
  }, [])

  useEffect(() => { checkEngine() }, [checkEngine])

  async function handleSyncEngine() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      // Step 1: sync parties
      const syncRes = await fetch('/api/bridge/sync-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const syncData = await syncRes.json()
      if (!syncRes.ok) throw new Error(syncData.error || 'Sync failed')

      // Step 2: create campaign
      const campRes = await fetch('/api/bridge/sample/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const campData = await campRes.json()
      if (!campRes.ok) throw new Error(campData.error || 'Campaign creation failed')

      setSyncMsg(`Synced ${syncData.synced} parties, campaign ready (turn ${campData.turn})`)
      setEngineStatus('ready')
    } catch (err) {
      setSyncMsg(`Error: ${err instanceof Error ? err.message : err}`)
    } finally {
      setSyncing(false)
    }
  }

  // Form state
  const [selectedParty, setSelectedParty] = useState('')
  const [actionType, setActionType] = useState('')
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [targetLgas, setTargetLgas] = useState<string[]>([])
  const [targetAzs, setTargetAzs] = useState<string[]>([])
  const [language, setLanguage] = useState('english')
  const [description, setDescription] = useState('')
  const [gmScore, setGmScore] = useState(6)

  // Run state
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Depend on partiesData?.parties — not `?? []` (new array every render while loading).
  const partyOptions = useMemo(
    () => (partiesData?.parties ?? []).map((p) => ({ value: p.name, label: p.name })),
    [partiesData?.parties],
  )

  const FormComponent = actionType ? FORM_COMPONENTS[actionType] : null

  function handleActionTypeChange(newType: string) {
    setActionType(newType)
    setParams({})
    setTargetLgas([])
    setTargetAzs([])
    setLanguage('english')
    setDescription('')
    setResult(null)
    setError(null)
  }

  async function handlePreview() {
    if (!selectedParty || !actionType) return

    setRunning(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/bridge/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          party_name: selectedParty,
          action_type: actionType,
          params,
          target_lgas: targetLgas,
          target_azs: targetAzs,
          language,
          description,
          gm_score: gmScore,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`)
      } else {
        setResult(data.engine_result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setRunning(false)
    }
  }

  // Extract data from engine result
  const isPollAction = actionType === 'poll' || actionType === 'epo_intelligence'
  const engineState = result?.state as Record<string, unknown> | undefined
  const partyStatuses = (engineState?.party_statuses as Record<string, unknown>[]) ?? []
  const selectedPartyStatus = partyStatuses.find((ps) => ps.name === selectedParty)
  const allPollResults = (engineState?.poll_results as Record<string, unknown>[]) ?? []
  const partyPolls = allPollResults.filter((p) => p.commissioned_by === selectedParty)

  const voteShares = result?.national_vote_shares as Record<string, number> | undefined
  const seatCounts = result?.seat_counts as Record<string, number> | undefined
  const turnout = result?.national_turnout as number | undefined

  const sortedParties = voteShares
    ? Object.entries(voteShares).sort(([, a], [, b]) => b - a)
    : null

  return (
    <div className="space-y-6">
      {/* Engine status */}
      {engineStatus !== 'ready' && (
        <div className={`rounded border px-4 py-3 text-sm flex items-center justify-between ${
          engineStatus === 'checking'
            ? 'border-aero-500/30 bg-aero-500/5 text-text-secondary'
            : engineStatus === 'offline'
              ? 'border-danger/30 bg-danger/5 text-danger'
              : 'border-amber-500/30 bg-amber-500/5 text-amber-400'
        }`}>
          <span>
            {engineStatus === 'checking' && 'Checking engine...'}
            {engineStatus === 'offline' && 'Engine is not running at localhost:8000. Start it first.'}
            {engineStatus === 'no-campaign' && 'Engine is running but has no active campaign.'}
          </span>
          {engineStatus === 'no-campaign' && (
            <AeroButton onClick={handleSyncEngine} loading={syncing}>
              Sync & Create Campaign
            </AeroButton>
          )}
        </div>
      )}
      {syncMsg && (
        <div className={`text-xs px-3 py-2 rounded border ${
          syncMsg.startsWith('Error') ? 'border-danger/20 text-danger' : 'border-success/20 text-success'
        }`}>
          {syncMsg}
        </div>
      )}

      {/* Configuration bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AeroSelect
          label="Party"
          value={selectedParty}
          onChange={(e) => setSelectedParty(e.target.value)}
          options={partyOptions}
          placeholder="Select a party..."
        />
        <AeroSelect
          label="Action Type"
          value={actionType}
          onChange={(e) => handleActionTypeChange(e.target.value)}
          options={ACTION_OPTIONS}
          placeholder="Select an action..."
        />
        <div className="space-y-1">
          <label htmlFor="gm-score" className="block text-xs uppercase tracking-widest text-text-secondary">
            GM Score (1-10)
          </label>
          <input
            id="gm-score"
            type="number"
            min={1}
            max={10}
            value={gmScore}
            onChange={(e) => setGmScore(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
            className="aero-input w-full"
          />
        </div>
      </div>

      {/* Dynamic form */}
      {FormComponent && (
        <div className="aero-panel p-4">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-3">
            Action Parameters
          </h3>
          <FormComponent
            params={params}
            onParamsChange={setParams}
            targetLgas={targetLgas}
            onTargetLgasChange={setTargetLgas}
            targetAzs={targetAzs}
            onTargetAzsChange={setTargetAzs}
            language={language}
            onLanguageChange={setLanguage}
            description={description}
            onDescriptionChange={setDescription}
          />
        </div>
      )}

      {/* Run button */}
      {actionType && selectedParty && (
        <AeroButton onClick={handlePreview} loading={running} disabled={!actionType || !selectedParty}>
          {running ? 'Running...' : `Run ${ACTION_OPTIONS.find((a) => a.value === actionType)?.label ?? 'Action'}`}
        </AeroButton>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="glow-line" />

          {/* Poll Results — shown first and prominently for poll/epo_intelligence */}
          {isPollAction && (
            partyPolls.length > 0
              ? <PollResults pollResults={partyPolls} />
              : (
                <div className="aero-panel p-4">
                  <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-2">Poll Results</h3>
                  <p className="text-sm text-text-muted">
                    No poll data returned. The engine may not have generated results for this configuration.
                    Check the raw output below for details.
                  </p>
                </div>
              )
          )}

          {/* Party Stats */}
          {selectedPartyStatus && (
            <div className="aero-panel p-4">
              <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-3">
                {selectedParty} — After Action
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {(['pc', 'cohesion', 'exposure', 'momentum', 'vote_share', 'seats', 'awareness'] as const).map((key) => {
                  const val = selectedPartyStatus[key]
                  const display = typeof val === 'number'
                    ? key === 'vote_share' ? `${(val * 100).toFixed(1)}%` : String(Math.round(val * 100) / 100)
                    : '—'
                  return (
                    <div key={key} className="text-center">
                      <div className="text-lg font-display font-bold text-aero-400">{display}</div>
                      <div className="text-[10px] uppercase tracking-widest text-text-secondary mt-0.5">
                        {key.replace('_', ' ')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Synergies/Scandals */}
          {((result.synergies as unknown[])?.length > 0 || (result.scandals as unknown[])?.length > 0) && (
            <div className="aero-panel p-4">
              <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-3">
                Synergies & Scandals
              </h3>
              {(result.synergies as Record<string, unknown>[])?.map((s, i) => (
                <div key={i} className="text-xs text-success mb-1">
                  Synergy: {JSON.stringify(s)}
                </div>
              ))}
              {(result.scandals as Record<string, unknown>[])?.map((s, i) => (
                <div key={i} className="text-xs text-danger mb-1">
                  Scandal: {JSON.stringify(s)}
                </div>
              ))}
            </div>
          )}

          {/* National Results — collapsed by default */}
          <details className="aero-panel p-4">
            <summary className="text-xs uppercase tracking-widest text-text-secondary cursor-pointer select-none">
              National Election Results
              {turnout != null && (
                <span className="ml-3 font-mono text-aero-400">
                  Turnout: {(turnout * 100).toFixed(1)}%
                </span>
              )}
            </summary>
            {sortedParties && (
              <div className="max-h-48 overflow-auto mt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-text-secondary border-b border-aero-900/30">
                      <th className="py-1.5 pr-3">Party</th>
                      <th className="py-1.5 pr-3 text-right">Vote Share</th>
                      <th className="py-1.5 pr-3 text-right">Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedParties.map(([name, share]) => (
                      <tr key={name} className={`border-b border-aero-900/20 ${name === selectedParty ? 'bg-aero-900/20' : ''}`}>
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
            )}
          </details>

          {/* Raw Output */}
          <details className="aero-panel p-4">
            <summary className="text-xs uppercase tracking-widest text-text-secondary cursor-pointer select-none">
              Raw Engine Output
            </summary>
            <pre className="mt-3 text-[10px] font-mono text-text-muted overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
