import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcPartyIncome, PC_HOARDING_CAP } from '@/lib/constants/actions'

export async function POST(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { turn } = await request.json()
  if (!turn) return NextResponse.json({ error: 'Turn number required' }, { status: 400 })

  const admin = createAdminClient()

  // Get all parties
  const { data: parties, error: partyError } = await admin.from('parties').select('id')
  if (partyError) return NextResponse.json({ error: partyError.message }, { status: 500 })

  // Count members per party
  const { data: memberCounts } = await admin
    .from('profiles')
    .select('party_id')
    .not('party_id', 'is', null)

  const countByParty: Record<string, number> = {}
  for (const row of memberCounts ?? []) {
    if (row.party_id) countByParty[row.party_id] = (countByParty[row.party_id] ?? 0) + 1
  }

  let initialized = 0

  for (const party of parties ?? []) {
    // Get latest party_state for this party
    const { data: latest } = await admin
      .from('party_state')
      .select('*')
      .eq('party_id', party.id)
      .order('turn', { ascending: false })
      .limit(1)
      .maybeSingle()

    const members = countByParty[party.id] ?? 1
    const income = calcPartyIncome(members)
    const newPC = latest
      ? Math.min(latest.pc + income, PC_HOARDING_CAP)
      : income

    const { error } = await admin.from('party_state').upsert(
      {
        party_id: party.id,
        turn,
        pc: newPC,
        cohesion: latest?.cohesion ?? 50,
        exposure: latest?.exposure ?? 0,
        momentum: latest?.momentum ?? 0,
        vote_share: latest?.vote_share ?? 0,
        seats: latest?.seats ?? 0,
        awareness: latest?.awareness ?? 0,
        epo_scores: latest?.epo_scores ?? {},
        poll_results: latest?.poll_results ?? null,
        scandal_history: latest?.scandal_history ?? null,
        action_history: latest?.action_history ?? null,
      },
      { onConflict: 'party_id,turn' }
    )

    if (error) return NextResponse.json({ error: `Party ${party.id}: ${error.message}` }, { status: 500 })
    initialized++
  }

  return NextResponse.json({ success: true, initialized })
}
