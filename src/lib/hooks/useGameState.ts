'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GameState {
  id: string
  turn: number
  phase: string
  submission_open: boolean
  deadline: string | null
  announcements: unknown[] | null
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('game_state')
        .select('id, turn, phase, submission_open, deadline, announcements')
        .order('turn', { ascending: false })
        .limit(1)
        .single()
      setGameState(data as unknown as GameState)
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { gameState, loading }
}
