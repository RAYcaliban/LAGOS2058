'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { ETHNIC_GROUP_OPTIONS, RELIGIOUS_GROUP_OPTIONS } from '@/lib/constants/character'

function CharacterCreateContent() {
  const { user, profile } = useAuth()
  const [characterName, setCharacterName] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // If character already created, redirect to dashboard
  if (profile?.character_name) {
    router.push('/dashboard')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        character_name: characterName,
        ethnicity,
        religion,
        bio: bio || null,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Auto-generate character wiki stub
    try {
      const slug = characterName.toLowerCase().replace(/\s+/g, '-')
      await fetch('/api/wiki/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterOnly: true,
          characterName,
          ethnicity,
          religion,
          bio,
          slug,
        }),
      })
    } catch {
      // Non-critical — wiki stub can be created later
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <FixedWidthContainer className="py-10">
      <AeroPanel className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500">
            CREATE CHARACTER
          </h1>
          <div className="glow-line mt-2" />
          <p className="text-sm text-text-secondary mt-2">
            Define your political persona for the LAGOS 2058 campaign
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AeroInput
            label="Character Name"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Your political persona's name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <AeroSelect
              label="Ethnicity"
              value={ethnicity}
              onChange={(e) => setEthnicity(e.target.value)}
              options={ETHNIC_GROUP_OPTIONS}
              placeholder="Select ethnicity"
              required
            />
            <AeroSelect
              label="Religion"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              options={RELIGIOUS_GROUP_OPTIONS}
              placeholder="Select religion"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="bio"
              className="block text-xs uppercase tracking-widest text-text-secondary"
            >
              Bio (optional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief backstory for your character..."
              rows={4}
              className="aero-input w-full resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
              {error}
            </div>
          )}

          <AeroButton type="submit" loading={loading} className="w-full">
            Create Character
          </AeroButton>
        </form>
      </AeroPanel>
    </FixedWidthContainer>
  )
}

export default function CharacterCreatePage() {
  return (
    <AuthGuard>
      <CharacterCreateContent />
    </AuthGuard>
  )
}
