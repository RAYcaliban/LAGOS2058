import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  transformSiteActionToExport,
  type ActionRow,
  type ActionsExportPayload,
} from '@/lib/utils/bridge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const turn = searchParams.get('turn')

  if (!turn) {
    return NextResponse.json({ error: 'turn parameter required' }, { status: 400 })
  }

  const turnNum = parseInt(turn, 10)
  if (isNaN(turnNum)) {
    return NextResponse.json({ error: 'turn must be a number' }, { status: 400 })
  }

  const supabase = await createClient()

  // Auth: GM/admin only
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

  // Fetch submitted actions for the turn
  const { data: actions, error: actionsError } = await supabase
    .from('action_submissions')
    .select('*')
    .eq('turn', turnNum)
    .eq('status', 'submitted')
    .order('created_at')

  if (actionsError) {
    return NextResponse.json({ error: actionsError.message }, { status: 500 })
  }

  if (!actions || actions.length === 0) {
    const payload: ActionsExportPayload = { turn: turnNum, actions: [], crises: [] }
    return NextResponse.json(payload)
  }

  // Cast DB rows to our ActionRow shape (Supabase uses Json for JSONB cols)
  const rows = actions as unknown as ActionRow[]

  // Collect unique party_ids and fetch party names
  const partyIds = [...new Set(rows.map((a) => a.party_id))]
  const { data: parties, error: partiesError } = await supabase
    .from('parties')
    .select('id, name')
    .in('id', partyIds)

  if (partiesError) {
    return NextResponse.json({ error: partiesError.message }, { status: 500 })
  }

  const partyNameById: Record<string, string> = {}
  for (const p of parties ?? []) {
    partyNameById[p.id] = p.name
  }

  // Transform each action
  const exportActions = rows.map((action) => {
    const partyName = partyNameById[action.party_id] ?? action.party_id
    return transformSiteActionToExport(action, partyName)
  })

  const payload: ActionsExportPayload = {
    turn: turnNum,
    actions: exportActions,
    crises: [],
  }

  return NextResponse.json(payload)
}
