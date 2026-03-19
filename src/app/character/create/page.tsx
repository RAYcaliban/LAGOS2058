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
import { ETHNIC_GROUP_OPTIONS, RELIGIOUS_GROUP_OPTIONS, religionToEngine } from '@/lib/constants/character'

function CharacterCreateContent() {
  const { user, profile, refetchProfile } = useAuth()
  const [characterName, setCharacterName] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // If character already created, redirect to dashboard
  useEffect(() => {
  if (profile?.character_name) {
    router.push('/dashboard')
  }
}, [profile?.character_name, router])

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
        religion: religionToEngine(religion),
        religion_display: religion,
        bio: bio || null,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Auto-generate character wiki stub (fire-and-forget)
    const slug = characterName.toLowerCase().replace(/\s+/g, '-')
    fetch('/api/wiki/auto-generate', {
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
    }).catch(() => {})

    // Navigate first — refetchProfile() would set character_name, triggering
    // the redirect guard above and unmounting this component before push fires
    window.location.href = '/dashboard'
  }

  return (
    <div className="poster-section min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="poster-bg" style={{ backgroundImage: "url('/images/hero-city.jpg')" }} />
      <div className="poster-overlay" style={{ background: 'rgba(10,15,20,0.82)' }} />
      <div className="poster-content w-full max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-6">
          <span className="pixel-brand text-3xl text-white">LAGOS</span>
          <span className="pixel-brand text-2xl ml-2" style={{ color: '#008751' }}>2058</span>
          <div className="pixel-brand text-lg mt-1" style={{ color: '#008751', letterSpacing: '0.4em' }}>★★★</div>
        </div>
      <AeroPanel className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="pixel-brand text-4xl text-white">
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
      </div>
    </div>
  )
}

export default function CharacterCreatePage() {
  return (
    <AuthGuard>
      <CharacterCreateContent />
    </AuthGuard>
  )
}
