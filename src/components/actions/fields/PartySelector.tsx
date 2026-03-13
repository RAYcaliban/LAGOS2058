'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AeroSelect } from '@/components/ui/AeroSelect'

interface PartySelectorProps {
  value: string
  onChange: (value: string) => void
  excludePartyId?: string
  error?: string
}

export function PartySelector({ value, onChange, excludePartyId, error }: PartySelectorProps) {
  const [parties, setParties] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('parties').select('id, name, full_name')
      if (data) {
        setParties(
          data
            .filter((p) => p.id !== excludePartyId)
            .map((p) => ({ value: p.name, label: `${p.name} — ${p.full_name}` }))
        )
      }
    }
    load()
  }, [excludePartyId])

  return (
    <AeroSelect
      label="Target Party"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={parties}
      placeholder="Select a party"
      error={error}
    />
  )
}
