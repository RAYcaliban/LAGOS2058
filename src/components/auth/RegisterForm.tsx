'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroPanel } from '@/components/ui/AeroPanel'

export function RegisterForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Profile is auto-created by database trigger on auth.users insert.
      // If email confirmation is disabled, redirect directly.
      if (data.session) {
        router.push('/dashboard')
        router.refresh()
        return
      }

      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <AeroPanel className="w-full max-w-md mx-auto text-center">
        <h2 className="font-display text-xl font-bold tracking-[3px] text-aero-500 mb-3">
          CHECK YOUR EMAIL
        </h2>
        <div className="glow-line mb-4" />
        <p className="text-text-secondary text-sm">
          We sent a confirmation link to <span className="text-text-primary font-medium">{email}</span>.
          Click it to activate your account.
        </p>
      </AeroPanel>
    )
  }

  return (
    <AeroPanel className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500">
          REGISTER
        </h1>
        <div className="glow-line mt-2" />
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

        <AeroInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="agent@lagos2058.ng"
          required
        />

        <AeroInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          required
          minLength={6}
        />

        {error && (
          <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        <AeroButton type="submit" loading={loading} className="w-full">
          Create Account
        </AeroButton>
      </form>

      <p className="text-center text-sm text-text-secondary mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-aero-400 hover:text-aero-300 transition-colors">
          Login
        </Link>
      </p>
    </AeroPanel>
  )
}
