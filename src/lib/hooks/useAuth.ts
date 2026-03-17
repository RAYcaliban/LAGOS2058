'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  display_name: string
  party_id: string | null
  role: string
  avatar_url: string | null
  character_name: string | null
  ethnicity: string | null
  religion: string | null
  religion_display: string | null
  bio: string | null
  discord_handle: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabaseRef.current
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }, [])

  const refetchProfile = useCallback(async () => {
    const currentUser = user ?? (await supabaseRef.current.auth.getUser()).data.user
    if (currentUser) await fetchProfile(currentUser.id)
  }, [user, fetchProfile])

  useEffect(() => {
    const supabase = supabaseRef.current

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchProfile(currentUser.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    await supabaseRef.current.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  return {
    user,
    profile,
    loading,
    signOut,
    refetchProfile,
    isGM: profile?.role === 'gm' || profile?.role === 'admin',
    hasParty: !!profile?.party_id,
    hasCharacter: !!profile?.character_name,
  }
}
