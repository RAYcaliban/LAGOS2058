'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { AeroButton } from '@/components/ui/AeroButton'
import { ETHNIC_GROUP_OPTIONS, RELIGIOUS_GROUP_OPTIONS } from '@/lib/constants/character'

const COLOR_PRESETS = [
  '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a',
  '#0d9488', '#0284c7', '#4f46e5', '#7c3aed', '#c026d3',
  '#e11d48', '#78716c',
]

export function CreatePartyForm() {
  const { user, profile } = useAuth()
  const [name, setName] = useState('')
  const [fullName, setFullName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [ethnicity, setEthnicity] = useState('')
  const [religion, setReligion] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (name.length < 2 || name.length > 6) {
      setError('Party abbreviation must be 2-6 characters')
      setLoading(false)
      return
    }

    if (!ethnicity) {
      setError('Please select an ethnicity')
      setLoading(false)
      return
    }

    if (!religion) {
      setError('Please select a religion')
      setLoading(false)
      return
    }

    if (!user || !profile) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const leaderName = profile.character_name || profile.display_name

    // Upload logo if provided
    let logoUrl: string | null = null
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('party-logos')
        .upload(path, logoFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload logo: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('party-logos').getPublicUrl(path)
      logoUrl = urlData.publicUrl
    }

    // Create party with owner_id
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .insert({
        name: name.toUpperCase(),
        full_name: fullName,
        color,
        leader_name: leaderName,
        owner_id: user.id,
        ethnicity: ethnicity || null,
        religion: religion || null,
        description: description || null,
        logo_url: logoUrl,
      } as any)
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

    // Auto-generate wiki stubs
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
      // Non-critical
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
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

      <div className="grid grid-cols-2 gap-4">
        <AeroSelect
          label="Ethnicity"
          value={ethnicity}
          onChange={(e) => setEthnicity(e.target.value)}
          options={ETHNIC_GROUP_OPTIONS}
          placeholder="Select ethnicity"
        />
        <AeroSelect
          label="Religion"
          value={religion}
          onChange={(e) => setReligion(e.target.value)}
          options={RELIGIOUS_GROUP_OPTIONS}
          placeholder="Select religion"
        />
      </div>

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

      <div className="space-y-1">
        <label className="block text-xs uppercase tracking-widest text-text-secondary">
          Party Logo
        </label>
        <div className="flex items-center gap-3">
          {logoPreview ? (
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
          {logoFile && (
            <button
              type="button"
              onClick={() => { setLogoFile(null); setLogoPreview(null) }}
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

      {error && (
        <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      <AeroButton type="submit" loading={loading} className="w-full">
        Create Party
      </AeroButton>
    </form>
  )
}
