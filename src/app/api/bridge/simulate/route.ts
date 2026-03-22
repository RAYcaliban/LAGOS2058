import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  transformSiteActionToExport,
  type ActionRow,
  type ActionsExportPayload,
} from '@/lib/utils/bridge'

const ENGINE_API_URL = process.env.ENGINE_API_URL ?? 'http://localhost:8000'

/**
 * POST /api/bridge/simulate?turn=N
 *
 * Dry-run: export actions → call engine preview → return results without
 * writing anything to Supabase.  GM/admin only.
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

  // ── Step 1: Export actions (read-only) ────────────────────────────────

  const { data: actions, error: actionsError } = await supabase
    .from('action_submissions')
    .select('*')
    .eq('turn', turnNum)
    .eq('status', 'submitted')
    .order('created_at')

  if (actionsError) {
    return NextResponse.json({ error: actionsError.message }, { status: 500 })
  }

  const rows = (actions ?? []) as unknown as ActionRow[]

  // Build party ID → name map
  const { data: allParties } = await supabase.from('parties').select('id, name')
  const partyNameById: Record<string, string> = {}
  for (const p of allParties ?? []) {
    partyNameById[p.id] = p.name
  }

  const exportActions = rows.map((a) =>
    transformSiteActionToExport(a, partyNameById[a.party_id] ?? a.party_id)
  )

  const _exportPayload: ActionsExportPayload = {
    turn: turnNum,
    actions: exportActions,
    crises: [],
  }

  // ── Step 2: Call engine preview (no state mutation) ───────────────────

  let engineResult: Record<string, unknown>
  try {
    const engineRes = await fetch(`${ENGINE_API_URL}/api/campaign/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actions: exportActions.map(({ site_action_id, gm_score, description, ...rest }) => rest),
        crises: [],
      }),
    })

    if (!engineRes.ok) {
      const body = await engineRes.text()
      return NextResponse.json(
        { error: `Engine error (${engineRes.status}): ${body}` },
        { status: 502 }
      )
    }

    engineResult = await engineRes.json()
  } catch (err) {
    return NextResponse.json(
      { error: `Cannot reach engine at ${ENGINE_API_URL}: ${err instanceof Error ? err.message : err}` },
      { status: 502 }
    )
  }

  // ── No Step 3 — skip all DB writes ───────────────────────────────────

  return NextResponse.json({
    success: true,
    simulated: true,
    turn: turnNum,
    actions_exported: exportActions.length,
    engine_result: engineResult,
  })
}
