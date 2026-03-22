import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  transformSiteActionToExport,
  transformEngineResultToImport,
  type ActionRow,
  type ActionsExportPayload,
} from '@/lib/utils/bridge'

const ENGINE_API_URL = process.env.ENGINE_API_URL ?? 'http://localhost:8000'

/**
 * POST /api/bridge/advance?turn=N
 *
 * One-click: export actions → call engine API → import results.
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

  // ── Step 1: Export actions ──────────────────────────────────────────

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
  const partyIdByName: Record<string, string> = {}
  for (const p of allParties ?? []) {
    partyNameById[p.id] = p.name
    partyIdByName[p.name] = p.id
  }

  const exportActions = rows.map((a) =>
    transformSiteActionToExport(a, partyNameById[a.party_id] ?? a.party_id)
  )

  const exportPayload: ActionsExportPayload = {
    turn: turnNum,
    actions: exportActions,
    crises: [],
  }

  // ── Step 2: Call the engine ─────────────────────────────────────────

  let engineResult: Record<string, unknown>
  try {
    const engineRes = await fetch(`${ENGINE_API_URL}/api/campaign/advance`, {
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

  // ── Step 3: Import results ──────────────────────────────────────────

  const importData = transformEngineResultToImport(engineResult, partyIdByName)

  // Upsert game state
  if (importData.game_state) {
    const { error } = await admin
      .from('game_state')
      .upsert({ ...importData.game_state, turn: turnNum }, { onConflict: 'turn' })
    if (error) {
      return NextResponse.json(
        { error: `Game state upsert: ${error.message}`, engine_result: engineResult },
        { status: 500 }
      )
    }
  }

  // Upsert party states
  let partiesUpdated = 0
  if (importData.party_states) {
    for (const ps of importData.party_states) {
      const row = { ...ps, turn: turnNum } as Record<string, unknown>
      const { error } = await admin
        .from('party_state')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(row as any, { onConflict: 'party_id,turn' })
      if (error) {
        return NextResponse.json(
          { error: `Party state upsert: ${error.message}`, engine_result: engineResult },
          { status: 500 }
        )
      }
      partiesUpdated++
    }
  }

  // Mark actions as processed
  let actionsProcessed = 0
  // Map site_action_ids from engine result back to action rows
  const resolved = (engineResult.actions_resolved as Record<string, unknown>[]) ?? []
  for (let i = 0; i < resolved.length; i++) {
    const siteActionId = exportActions[i]?.site_action_id
    if (!siteActionId) continue
    const { error } = await admin
      .from('action_submissions')
      .update({
        status: 'processed',
        quality_score: resolved[i]?.gm_score as number ?? null,
        gm_notes: resolved[i]?.notes as string ?? null,
      })
      .eq('id', siteActionId)
    if (!error) actionsProcessed++
  }

  return NextResponse.json({
    success: true,
    turn: turnNum,
    actions_exported: exportActions.length,
    parties_updated: partiesUpdated,
    actions_processed: actionsProcessed,
    engine_result: engineResult,
  })
}
