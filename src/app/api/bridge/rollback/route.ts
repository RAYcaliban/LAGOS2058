import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/bridge/rollback?turn=N
 *
 * Undo the effects of an engine advance for a given turn:
 * 1. Reset action_submissions status from 'processed' → 'submitted', clear scores
 * 2. Delete party_state rows for that turn
 * 3. Clear national_results and lga_results from game_state for that turn
 *
 * NEVER touches the parties table.
 * GM/admin only.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const turn = searchParams.get('turn')

  if (!turn) {
    return NextResponse.json({ error: 'turn parameter required' }, { status: 400 })
  }
  const turnNum = parseInt(turn, 10)
  if (isNaN(turnNum)) {
    return NextResponse.json({ error: 'turn must be a number' }, { status: 400 })
  }

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || (profile.role !== 'gm' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const summary: Record<string, unknown> = { turn: turnNum }

  // ── 1. Reset action_submissions for this turn ─────────────────────────
  // Set 'processed' actions back to 'submitted', clear quality_score and gm_notes
  const { data: resetActions, error: actionsError } = await admin
    .from('action_submissions')
    .update({
      status: 'submitted',
      quality_score: null,
      gm_notes: null,
    })
    .eq('turn', turnNum)
    .eq('status', 'processed')
    .select('id')

  if (actionsError) {
    return NextResponse.json({ error: `Actions reset failed: ${actionsError.message}` }, { status: 500 })
  }
  summary.actions_reset = resetActions?.length ?? 0

  // ── 2. Delete party_state rows for this turn ──────────────────────────
  // This removes the engine-written stats. The party-state/init endpoint
  // can recreate clean rows when needed.
  const { data: deletedStates, error: stateError } = await admin
    .from('party_state')
    .delete()
    .eq('turn', turnNum)
    .select('id')

  if (stateError) {
    return NextResponse.json({ error: `Party state delete failed: ${stateError.message}` }, { status: 500 })
  }
  summary.party_states_deleted = deletedStates?.length ?? 0

  // ── 3. Clear results from game_state ──────────────────────────────────
  const { error: gsError } = await admin
    .from('game_state')
    .update({
      national_results: null,
      lga_results: null,
    })
    .eq('turn', turnNum)

  if (gsError) {
    return NextResponse.json({ error: `Game state clear failed: ${gsError.message}` }, { status: 500 })
  }
  summary.game_state_cleared = true

  return NextResponse.json({ success: true, ...summary })
}
