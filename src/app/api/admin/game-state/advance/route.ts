import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()

  // Get current turn
  const { data: current, error: fetchError } = await admin
    .from('game_state')
    .select('turn')
    .order('turn', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const nextTurn = (current?.turn ?? 0) + 1

  const { error } = await admin.from('game_state').insert({
    turn: nextTurn,
    phase: 'submission',
    submission_open: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, turn: nextTurn })
}
