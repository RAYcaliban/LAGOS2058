'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useParty } from '@/lib/hooks/useParty'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { PageHeader } from '@/components/layout/PageHeader'
import { ETHNIC_GROUP_OPTIONS, RELIGIOUS_GROUP_OPTIONS, religionToEngine } from '@/lib/constants/character'

const COLOR_PRESETS = [
  '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a',
  '#0d9488', '#0284c7', '#4f46e5', '#7c3aed', '#c026d3',
  '#e11d48', '#78716c',
]

function PartyEditPanel({ partyId, userId }: { partyId: string; userId: string }) {
  const { party, loading: partyLoading, isOwner, refetch } = useParty(partyId, userId)
  const [abbrev, setAbbrev] = useState('')
  const [fullName, setFullName] = useState('')
  const [color, setColor] = useState('#0284c7')
  const [partyEthnicity, setPartyEthnicity] = useState('')
  const [partyReligion, setPartyReligion] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (party) {
      setAbbrev(party.name)
      setFullName(party.full_name)
      setColor(party.color)
      setPartyEthnicity(party.ethnicity ?? '')
      setPartyReligion(party.religion_display ?? party.religion ?? '')
      setDescription(party.description ?? '')
      setLogoPreview(party.logo_url)
    }
  }, [party])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setRemoveLogo(false)
  }

  async function handlePartySave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (abbrev.length < 2 || abbrev.length > 6) {
      setError('Party abbreviation must be 2-6 characters')
      return
    }

    setSaving(true)
    const supabase = createClient()

    let logoUrl: string | null | undefined = undefined

    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${userId}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('party-logos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload logo: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: urlData } = supabase.storage.from('party-logos').getPublicUrl(path)
      logoUrl = urlData.publicUrl
    } else if (removeLogo) {
      logoUrl = null
    }

    const updates: Record<string, unknown> = {
      name: abbrev.toUpperCase(),
      full_name: fullName,
      color,
      ethnicity: partyEthnicity || null,
      religion: partyReligion ? religionToEngine(partyReligion) : null,
      religion_display: partyReligion || null,
      description: description || null,
    }
    if (logoUrl !== undefined) {
      updates.logo_url = logoUrl
    }

    const { error: updateError } = await supabase
      .from('parties')
      .update(updates)
      .eq('id', partyId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setLogoFile(null)
    setRemoveLogo(false)
    await refetch()
    setSuccess(true)
    setSaving(false)
  }

  if (partyLoading) {
    return (
      <AeroPanel className="max-w-lg mx-auto mt-6">
        <p className="text-text-secondary text-sm text-center">Loading party data...</p>
      </AeroPanel>
    )
  }

  if (!party || !isOwner) return null

  return (
    <AeroPanel className="max-w-lg mx-auto mt-6">
      <h3 className="naira-header mb-4">Edit Party</h3>
      <form onSubmit={handlePartySave} className="space-y-4">
        {/* Logo */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest text-text-secondary">
            Party Logo
          </label>
          <div className="flex items-center gap-3">
            {logoPreview && !removeLogo ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-12 h-12 rounded-md object-cover border border-border-primary"
              />
            ) : (
              <div className="w-12 h-12 rounded-md border border-border-primary border-dashed flex items-center justify-center text-text-secondary text-xs">
                Logo
              </div>
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="aero-input text-sm cursor-pointer px-3 py-2 hover:border-aero-500 transition-colors"
            >
              {logoFile ? logoFile.name : 'Upload image (max 2MB)'}
            </button>
            {(logoPreview || logoFile) && !removeLogo && (
              <button
                type="button"
                onClick={() => {
                  setLogoFile(null)
                  setLogoPreview(null)
                  setRemoveLogo(true)
                }}
                className="text-text-secondary hover:text-danger text-xs transition-colors"
              >
                Remove
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <AeroInput
            label="Abbreviation"
            value={abbrev}
            onChange={(e) => setAbbrev(e.target.value)}
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

        {/* Ethnicity & Religion */}
        <div className="grid grid-cols-2 gap-4">
          <AeroSelect
            label="Ethnicity"
            value={partyEthnicity}
            onChange={(e) => setPartyEthnicity(e.target.value)}
            options={ETHNIC_GROUP_OPTIONS}
            placeholder="Select ethnicity"
          />
          <AeroSelect
            label="Religion"
            value={partyReligion}
            onChange={(e) => setPartyReligion(e.target.value)}
            options={RELIGIOUS_GROUP_OPTIONS}
            placeholder="Select religion"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest text-text-secondary">
            Party Color
          </label>
          <div className="flex gap-2 flex-wrap items-center">
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
            <label
              className={`w-8 h-8 rounded-md overflow-hidden cursor-pointer transition-all hover:scale-105 relative ${
                !COLOR_PRESETS.includes(color)
                  ? 'ring-2 ring-aero-500 ring-offset-2 ring-offset-bg-primary scale-110'
                  : ''
              }`}
              title="Custom color"
              style={{ backgroundColor: color }}
            >
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {COLOR_PRESETS.includes(color) && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none">+</span>
              )}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-text-secondary font-mono">{color}</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest text-text-secondary">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your party stand for?"
            maxLength={500}
            rows={3}
            className="aero-input w-full resize-none"
          />
          <p className="text-xs text-text-secondary text-right">{description.length}/500</p>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-aero-400 bg-aero-500/10 border border-aero-500/20 rounded px-3 py-2">
            Party updated successfully.
          </div>
        )}

        <AeroButton type="submit" loading={saving} className="w-full">
          Save Party Changes
        </AeroButton>
      </form>
    </AeroPanel>
  )
}

function ProfileContent() {
  const { user, profile, refetchProfile } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [bio, setBio] = useState('')
  const [discordHandle, setDiscordHandle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '')
      setCharacterName(profile.character_name ?? '')
      setEthnicity(profile.ethnicity ?? '')
      setReligion(profile.religion_display ?? profile.religion ?? '')
      setBio(profile.bio ?? '')
      setDiscordHandle(profile.discord_handle ?? '')
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
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
        display_name: displayName,
        character_name: characterName,
        ethnicity,
        religion: religionToEngine(religion),
        religion_display: religion,
        bio: bio || null,
        discord_handle: discordHandle || null,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await refetchProfile()
    setSuccess(true)
    setLoading(false)
  }

  return (
    <>
      <PageHeader
        title="PROFILE"
        label="Fifth Republic · Player Profile"
        image="/images/govt-building.jpg"
        wash="green"
        subtitle="Edit your character details."
      />
      <FixedWidthContainer className="py-10">
        <AeroPanel className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AeroInput
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              required
            />

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

            <AeroInput
              label="Discord Handle (optional)"
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              placeholder="e.g. username"
            />

            {error && (
              <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-aero-400 bg-aero-500/10 border border-aero-500/20 rounded px-3 py-2">
                Profile updated successfully.
              </div>
            )}

            <AeroButton type="submit" loading={loading} className="w-full">
              Save Changes
            </AeroButton>
          </form>
        </AeroPanel>

        {profile?.party_id && user && (
          <PartyEditPanel partyId={profile.party_id} userId={user.id} />
        )}
      </FixedWidthContainer>
    </>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
