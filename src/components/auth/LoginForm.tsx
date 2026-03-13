'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AeroInput } from '@/components/ui/AeroInput'
import { AeroButton } from '@/components/ui/AeroButton'
import { AeroPanel } from '@/components/ui/AeroPanel'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <AeroPanel className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-bold tracking-[4px] text-aero-500">
          LOGIN
        </h1>
        <div className="glow-line mt-2" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Enter password"
          required
        />

        {error && (
          <div className="text-sm text-danger bg-danger-light border border-danger/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        <AeroButton type="submit" loading={loading} className="w-full">
          Sign In
        </AeroButton>
      </form>

      <p className="text-center text-sm text-text-secondary mt-4">
        No account?{' '}
        <Link href="/register" className="text-aero-400 hover:text-aero-300 transition-colors">
          Register
        </Link>
      </p>
    </AeroPanel>
  )
}
