import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ENGINE_API_URL = process.env.ENGINE_API_URL ?? 'http://localhost:8000'

/**
 * POST /api/bridge/sync-parties
 *
 * Push all site parties (from Supabase) into the engine so party names match.
 * Optionally accepts { engine_url } in body.
 * GM/admin only.
 */
export async function POST(request: Request) {
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

  let engineUrl = ENGINE_API_URL
  try {
    const body = await request.json().catch(() => ({}))
    if (body.engine_url) engineUrl = body.engine_url
  } catch { /* empty body is fine */ }

  // Fetch all parties from Supabase
  const { data: parties, error } = await supabase
    .from('parties')
    .select('name, full_name, color, ethnicity, religion')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!parties || parties.length === 0) {
    return NextResponse.json({ error: 'No parties in database' }, { status: 400 })
  }

  // Build engine PartySchema objects
  // The engine expects: name, full_name, positions (28 floats), valence,
  // leader_ethnicity, religious_alignment, color
  const engineParties = parties.map((p) => ({
    name: p.name,
    full_name: p.full_name || p.name,
    // Positions default to 28 zeros if not stored on the party
    positions: new Array(28).fill(0.0),
    valence: 0.0,
    leader_ethnicity: p.ethnicity || '',
    religious_alignment: p.religion || '',
    color: p.color || '#888888',
  }))

  // Push to engine — first clear existing, then import
  try {
    // Get existing engine parties to delete them
    const listRes = await fetch(`${engineUrl}/api/parties`)
    if (listRes.ok) {
      const listData = await listRes.json()
      for (const ep of listData.parties || []) {
        await fetch(`${engineUrl}/api/parties/${encodeURIComponent(ep.name)}`, {
          method: 'DELETE',
        })
      }
    }

    // Import site parties
    const importRes = await fetch(`${engineUrl}/api/parties/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parties: engineParties }),
    })

    if (!importRes.ok) {
      const body = await importRes.text()
      return NextResponse.json(
        { error: `Engine import failed: ${body}` },
        { status: 502 }
      )
    }

    const result = await importRes.json()
    return NextResponse.json({
      success: true,
      synced: result.count ?? engineParties.length,
      parties: engineParties.map((p) => p.name),
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Cannot reach engine: ${err instanceof Error ? err.message : err}` },
      { status: 502 }
    )
  }
}
