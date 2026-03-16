'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useGameConfig(key: string): { value: unknown; loading: boolean } {
  const [value, setValue] = useState<unknown>(undefined)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('game_config')
        .select('value')
        .eq('key', key)
        .maybeSingle()
      setValue(data?.value ?? null)
      setLoading(false)
    }
    fetch()
  }, [supabase, key])

  return { value, loading }
}
