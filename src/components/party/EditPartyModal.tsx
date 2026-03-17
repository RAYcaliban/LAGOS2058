'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroSelect } from '@/components/ui/AeroSelect'
import { ETHNIC_GROUP_OPTIONS, RELIGIOUS_GROUP_OPTIONS, religionToEngine } from '@/lib/constants/character'

const COLOR_PRESETS = [
  '#dc2626', '#ea580c', '#d97706', '#65a30d', '#16a34a',
  '#0d9488', '#0284c7', '#4f46e5', '#7c3aed', '#c026d3',
  '#e11d48', '#78716c',
]

interface EditPartyModalProps {
  party: {
    id: string
    name: string
    full_name: string
    color: string
    ethnicity: string | null
    religion: string | null
    religion_display: string | null
    description: string | null
    logo_url: string | null
  }
  userId: string
  onClose: () => void
  onSaved: () => void
}

export function EditPartyModal({ party, userId, onClose, onSaved }: EditPartyModalProps) {
  const [name, setName] = useState(party.name)
  const [fullName, setFullName] = useState(party.full_name)
  const [color, setColor] = useState(party.color)
  const [ethnicity, setEthnicity] = useState(party.ethnicity ?? '')
  const [religion, setReligion] = useState(party.religion_display ?? party.religion ?? '')
  const [description, setDescription] = useState(party.description ?? '')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(party.logo_url)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.length < 2 || name.length > 6) {
      setError('Party abbreviation must be 2-6 characters')
      return
    }

    setLoading(true)
    const supabase = createClient()

    let logoUrl: string | null | undefined = undefined

    // Upload new logo
    if (logoFile) {
      const ext = logoFile.name.split('.').pop()
      const path = `${userId}-${Date.now()}.${ext}`
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
    } else if (removeLogo) {
      logoUrl = null
    }

    const updates: Record<string, unknown> = {
      name: name.toUpperCase(),
      full_name: fullName,
      color,
      ethnicity: ethnicity || null,
      religion: religion ? religionToEngine(religion) : null,
      religion_display: religion || null,
      description: description || null,
    }
    if (logoUrl !== undefined) {
      updates.logo_url = logoUrl
    }

    const { error: updateError } = await supabase
      .from('parties')
      .update(updates)
      .eq('id', party.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <AeroPanel className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="naira-header mb-4">Edit Party</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Ethnicity & Religion */}
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

          <div className="flex gap-2 justify-end">
            <AeroButton variant="ghost" type="button" onClick={onClose} disabled={loading} className="text-xs">
              Cancel
            </AeroButton>
            <AeroButton type="submit" loading={loading} className="text-xs">
              Save Changes
            </AeroButton>
          </div>
        </form>
      </AeroPanel>
    </div>
  )
}
