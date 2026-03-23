import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  mapActionTypeToEngine,
  lgaNamesToIndices,
  azCodesToInts,
} from '@/lib/utils/bridge'

const ENGINE_API_URL = process.env.ENGINE_API_URL ?? 'http://localhost:8000'

/**
 * POST /api/bridge/sample
 *
 * Sandbox: accept a single fabricated action (no DB row required),
 * transform it, call engine /api/campaign/preview, return raw result.
 * GM/admin only. No DB writes whatsoever.
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

  // Parse body
  let body: {
    party_name: string
    action_type: string
    params: Record<string, unknown>
    target_lgas: string[]
    target_azs: string[]
    language: string
    description: string
    gm_score: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { party_name, action_type, params, target_lgas, target_azs, language, description, gm_score } = body

  if (!party_name || !action_type) {
    return NextResponse.json({ error: 'party_name and action_type are required' }, { status: 400 })
  }

  // Transform to engine format
  const engineType = mapActionTypeToEngine(action_type)
  const engineParams = { ...(params ?? {}) }

  // Rename issue_dimensions → dimensions
  if ('issue_dimensions' in engineParams) {
    engineParams.dimensions = engineParams.issue_dimensions
    delete engineParams.issue_dimensions
  }

  // Set gm_score in parameters
  if (gm_score != null) {
    engineParams.gm_score = gm_score
  }

  // Extract district from params if present
  const targetDistricts = engineParams.district
    ? [String(engineParams.district)]
    : null

  // Extract target_party from params if present
  const targetParty = engineParams.target_party
    ? String(engineParams.target_party)
    : null

  const targetLgaIndices = target_lgas?.length > 0
    ? lgaNamesToIndices(target_lgas)
    : null

  const targetAzInts = target_azs?.length > 0
    ? azCodesToInts(target_azs)
    : null

  const engineAction = {
    party: party_name,
    action_type: engineType,
    target_lgas: targetLgaIndices,
    target_azs: targetAzInts,
    target_districts: targetDistricts,
    target_party: targetParty,
    language: language ?? 'english',
    parameters: engineParams,
    description: description ?? '',
  }

  // Call engine preview
  let engineResult: Record<string, unknown>
  try {
    const engineRes = await fetch(`${ENGINE_API_URL}/api/campaign/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actions: [engineAction],
        crises: [],
      }),
    })

    if (!engineRes.ok) {
      const text = await engineRes.text()
      return NextResponse.json(
        { error: `Engine error (${engineRes.status}): ${text}` },
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

  // The engine queues polls into pending_polls (delivered next turn), so they
  // won't appear in poll_results after a single-turn preview.  Merge them in
  // so the sandbox can display poll graphs immediately.
  const state = engineResult.state as Record<string, unknown> | undefined
  if (state) {
    const pending = (state.pending_polls as unknown[]) ?? []
    const delivered = (state.poll_results as unknown[]) ?? []
    if (pending.length > 0) {
      state.poll_results = [...delivered, ...pending]
    }
  }

  return NextResponse.json({
    success: true,
    engine_result: engineResult,
  })
}
