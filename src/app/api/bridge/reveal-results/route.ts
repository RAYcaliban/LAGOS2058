import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/bridge/reveal-results
 * Body: { released: boolean }
 *
 * Toggle the `results_released` game_config flag.
 * When true, players can see vote_share, seats, and processed actions.
 * GM/admin only.
 */
export async function POST(request: Request) {
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

  const { released } = await request.json()
  if (typeof released !== 'boolean') {
    return NextResponse.json({ error: 'released (boolean) required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('game_config')
    .upsert(
      { key: 'results_released', value: released, description: 'Whether election results are visible to players' },
      { onConflict: 'key' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, results_released: released })
}

/**
 * GET /api/bridge/reveal-results
 * Returns the current results_released status. GM/admin only.
 */
export async function GET() {
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

  const { data } = await supabase
    .from('game_config')
    .select('value')
    .eq('key', 'results_released')
    .maybeSingle()

  return NextResponse.json({ results_released: data?.value === true })
}
