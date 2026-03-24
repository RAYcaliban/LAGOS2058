'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { PCCostCalculator } from './PCCostCalculator'
import { QualityRubric } from './QualityRubric'
import { computeActionCost } from '@/lib/utils/pc-calculator'
import { PC_HOARDING_CAP } from '@/lib/constants/actions'

// Dynamic imports to avoid loading all forms at once
import { RallyForm } from './forms/RallyForm'
import { AdvertisingForm } from './forms/AdvertisingForm'
import { GroundGameForm } from './forms/GroundGameForm'
import { MediaForm } from './forms/MediaForm'
import { EndorsementForm } from './forms/EndorsementForm'
import { PatronageForm } from './forms/PatronageForm'
import { EthnicMobilizationForm } from './forms/EthnicMobilizationForm'
import { EPOEngagementForm } from './forms/EPOEngagementForm'
import { OppositionResearchForm } from './forms/OppositionResearchForm'
import { CrisisResponseForm } from './forms/CrisisResponseForm'
import { ManifestoForm } from './forms/ManifestoForm'
import { FundraisingForm } from './forms/FundraisingForm'
import { PollForm } from './forms/PollForm'
import { EPOIntelligenceForm } from './forms/EPOIntelligenceForm'

const ACTION_OPTIONS = [
  { value: '', label: 'Select an action type...' },
  { value: 'rally', label: 'Rally (2 PC)' },
  { value: 'advertising', label: 'Advertising (2+ PC)' },
  { value: 'ground_game', label: 'Ground Game (3+ PC)' },
  { value: 'media', label: 'Media (1 PC)' },
  { value: 'endorsement', label: 'Endorsement (2+ PC)' },
  { value: 'patronage', label: 'Patronage (3+ PC)' },
  { value: 'ethnic_mobilization', label: 'Ethnic Mobilization (2+ PC)' },
  { value: 'epo_engagement', label: 'EPO Engagement (3+ PC)' },
  { value: 'opposition_research', label: 'Opposition Research (2 PC)' },
  { value: 'crisis_response', label: 'Crisis Response (2+ PC)' },
  { value: 'manifesto', label: 'Manifesto (3 PC)' },
  { value: 'fundraising', label: 'Fundraising (2 PC)' },
  { value: 'poll', label: 'Poll (1-3 PC)' },
  { value: 'epo_intelligence', label: 'EPO Intelligence (FREE)' },
]

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

export interface ActionFormProps {
  params: Record<string, unknown>
  onParamsChange: (params: Record<string, unknown>) => void
  targetLgas: string[]
  onTargetLgasChange: (lgas: string[]) => void
  targetAzs: string[]
  onTargetAzsChange: (azs: string[]) => void
  language: string
  onLanguageChange: (lang: string) => void
  description: string
  onDescriptionChange: (desc: string) => void
  partyId?: string
}

interface ActionBuilderProps {
  partyId: string
  turn: number
  pcAvailable: number
  totalPCSpent: number
  onActionCreated: () => void
  submissionOpen?: boolean
  onSave?: (action: {
    action_type: string
    params: Record<string, unknown>
    target_lgas: string[]
    target_azs: string[]
    language: string
    description: string
    pc_cost: number
  }) => Promise<void>
}

export function ActionBuilder({ partyId, turn, pcAvailable, totalPCSpent, onActionCreated, submissionOpen = true, onSave }: ActionBuilderProps) {
  const [actionType, setActionType] = useState('')
  const [params, setParams] = useState<Record<string, unknown>>({})
  const [targetLgas, setTargetLgas] = useState<string[]>([])
  const [targetAzs, setTargetAzs] = useState<string[]>([])
  const [language, setLanguage] = useState('english')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const actionCost = useMemo(() => {
    if (!actionType) return 0
    return computeActionCost(actionType, params, targetLgas.length, targetAzs.length)
  }, [actionType, params, targetLgas.length, targetAzs.length])

  const FormComponent = actionType ? FORM_COMPONENTS[actionType] : null

  function resetForm() {
    setActionType('')
    setParams({})
    setTargetLgas([])
    setTargetAzs([])
    setLanguage('english')
    setDescription('')
    setError(null)
  }

  async function handleSaveDraft() {
    if (!actionType) return
    // Polls have no player-facing description field — skip the check
    if (actionType !== 'poll' && description.length < 20) {
      setError('Description must be at least 20 characters')
      return
    }

    setSaving(true)
    setError(null)

    try {
      if (onSave) {
        await onSave({
          action_type: actionType,
          params,
          target_lgas: targetLgas,
          target_azs: targetAzs,
          language,
          description,
          pc_cost: actionCost,
        })
      } else {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await supabase.from('action_submissions').insert({
          party_id: partyId,
          turn,
          action_type: actionType,
          params,
          target_lgas: targetLgas.length > 0 ? targetLgas : null,
          target_azs: targetAzs.length > 0 ? targetAzs : null,
          language,
          pc_cost: actionCost,
          status: 'draft',
          description,
        } as any)

        if (insertError) {
          setError(insertError.message)
          setSaving(false)
          return
        }
      }

      resetForm()
      onActionCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
    setSaving(false)
  }

  return (
    <AeroPanel>
      <h2 className="naira-header mb-3">{submissionOpen ? 'Create Action' : 'Preview Actions'}</h2>
      <div className="glow-line mb-4" />

      {!submissionOpen && (
        <div className="rounded border border-aero-500/30 bg-aero-500/5 px-3 py-2 text-xs text-aero-400 mb-4">
          Submissions are currently closed. You can preview action forms below but cannot save or submit.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <AeroSelect
            label="Action Type"
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value)
              setParams({})
              setTargetLgas([])
              setTargetAzs([])
            }}
            options={ACTION_OPTIONS.slice(1)}
            placeholder="Select an action type..."
          />

          {/* D3: Manifesto turn-1 warning */}
          {actionType === 'manifesto' && turn > 1 && (
            <div className="rounded border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
              Warning: Manifestos submitted after Turn 1 may not be processed. This action must be completed by Turn 1.
            </div>
          )}

          {FormComponent && (
            <div className={!submissionOpen ? 'pointer-events-none opacity-60' : ''}>
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
                partyId={partyId}
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
              {error}
            </div>
          )}

          {actionType && submissionOpen && (
            <div className="flex gap-3">
              <AeroButton onClick={handleSaveDraft} loading={saving} disabled={!actionType}>
                Save as Draft
              </AeroButton>
              <AeroButton variant="ghost" onClick={resetForm}>
                Clear
              </AeroButton>
            </div>
          )}
        </div>

        {/* Right: Cost & Rubric */}
        <div className="space-y-4">
          {actionType && (
            <PCCostCalculator
              actionCost={actionCost}
              totalSpent={totalPCSpent}
              pcAvailable={pcAvailable}
              hoardingCap={PC_HOARDING_CAP}
            />
          )}
          <QualityRubric />
        </div>
      </div>
    </AeroPanel>
  )
}
