import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ENGINE_API_URL = process.env.ENGINE_API_URL ?? 'http://localhost:8000'

/**
 * POST /api/bridge/sample/setup
 *
 * Create a new campaign session in the engine so the sandbox can run previews.
 * Assumes parties have already been synced via /api/bridge/sync-parties.
 * GM/admin only.
 */
export async function POST() {
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

  try {
    const res = await fetch(`${ENGINE_API_URL}/api/campaign/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_turns: 8, n_monte_carlo: 3 }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Engine error (${res.status}): ${text}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      success: true,
      turn: data.turn,
      phase: data.phase,
      parties: data.party_statuses?.length ?? 0,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Cannot reach engine: ${err instanceof Error ? err.message : err}` },
      { status: 502 }
    )
  }
}
