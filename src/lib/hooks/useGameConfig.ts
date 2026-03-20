'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGameConfig(key: string): { value: unknown; loading: boolean } {
  const [value, setValue] = useState<unknown>(undefined)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    async function fetch() {
      const { data } = await supabaseRef.current
        .from('game_config')
        .select('value')
        .eq('key', key)
        .maybeSingle()
      setValue(data?.value ?? null)
      setLoading(false)
    }
    fetch()
  }, [key])

  return { value, loading }
}
