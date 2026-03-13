'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'

const ETHNICITY_OPTIONS = [
  { value: 'yoruba', label: 'Yoruba' },
  { value: 'igbo', label: 'Igbo' },
  { value: 'hausa', label: 'Hausa' },
  { value: 'fulani', label: 'Fulani' },
  { value: 'ijaw', label: 'Ijaw' },
  { value: 'kanuri', label: 'Kanuri' },
  { value: 'tiv', label: 'Tiv' },
  { value: 'mixed', label: 'Mixed/Multi-ethnic' },
  { value: 'other', label: 'Other' },
]

const RELIGION_OPTIONS = [
  { value: 'islam', label: 'Islam' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'secular', label: 'Secular' },
  { value: 'mixed', label: 'Mixed' },
]

const COLOR_PRESETS = [
  '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a',
  '#0d9488', '#0284c7', '#4f46e5', '#7c3aed', '#c026d3',
  '#e11d48', '#78716c',
]

export default function PartyRegisterPage() {
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [leaderName, setLeaderName] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (name.length < 2 || name.length > 6) {
      setError('Party abbreviation must be 2-6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Create party
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        name: name.toUpperCase(),
        full_name: fullName,
        color,
        leader_name: leaderName,
        ethnicity,
        religion,
      })
      .select()
      .single()

    if (partyError) {
      setError(partyError.message)
      setLoading(false)
      return
    }

    // Update profile with party_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ party_id: party.id })
      .eq('id', user.id)

    if (profileError) {
      setError('Party created but failed to link to your profile')
      setLoading(false)
      return
    }

    // Auto-generate wiki stubs via API route
    try {
      await fetch('/api/wiki/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: party.id,
          partyName: name.toUpperCase(),
          fullName,
          leaderName,
          color,
          ethnicity,
          religion,
        }),
      })
    } catch {
      // Non-critical — wiki stubs can be created later
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthGuard>
      <FixedWidthContainer className="py-10">
        <AeroPanel className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500">
              REGISTER PARTY
            </h1>
            <div className="glow-line mt-2" />
            <p className="text-sm text-text-secondary mt-2">
              Create your political party to enter the campaign
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AeroInput
                label="Abbreviation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. APC"
                maxLength={6}
                required
              />
              <AeroInput
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="All Progressives Congress"
                required
              />
            </div>

            <AeroInput
              label="Party Leader"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              placeholder="Leader character name"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <AeroSelect
                label="Ethnicity"
                value={ethnicity}
                onChange={(e) => setEthnicity(e.target.value)}
                options={ETHNICITY_OPTIONS}
                placeholder="Select ethnicity"
                required
              />
              <AeroSelect
                label="Religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                options={RELIGION_OPTIONS}
                placeholder="Select religion"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-widest text-text-secondary">
                Party Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-md transition-all ${
                      color === c
                        ? 'ring-2 ring-aero-500 ring-offset-2 ring-offset-bg-primary scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            <AeroButton type="submit" loading={loading} className="w-full">
              Create Party
            </AeroButton>
          </form>
        </AeroPanel>
      </FixedWidthContainer>
    </AuthGuard>
  )
}
