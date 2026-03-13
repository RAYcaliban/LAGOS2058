'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroPanel } from '@/components/ui/AeroPanel'

interface ProfileSetupFormProps {
  userId: string
  email: string
}

export function ProfileSetupForm({ userId, email }: ProfileSetupFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      display_name: displayName,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AeroPanel className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-display text-xl font-bold tracking-[3px] text-aero-500">
          COMPLETE PROFILE
        </h1>
        <div className="glow-line mt-2" />
        <p className="text-sm text-text-secondary mt-2">
          Set up your player profile to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AeroInput
          label="Display Name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your in-game name"
          required
        />

        <div className="text-xs text-text-muted">
          Email: {email}
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        <AeroButton type="submit" loading={loading} className="w-full">
          Continue
        </AeroButton>
      </form>
    </AeroPanel>
  )
}
