'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  requireParty?: boolean
  requireGM?: boolean
}

export function AuthGuard({ children, requireParty = false, requireGM = false }: AuthGuardProps) {
  const { user, profile, loading, isGM, hasParty } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!profile) {
      // Profile not yet created — redirect to setup
      return
    }

    if (requireGM && !isGM) {
      router.push('/dashboard')
      return
    }

    if (requireParty && !hasParty) {
      router.push('/party/register')
      return
    }
  }, [user, profile, loading, isGM, hasParty, requireParty, requireGM, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-aero-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (requireGM && !isGM) || (requireParty && !hasParty)) {
    return null
  }

  return <>{children}</>
}
