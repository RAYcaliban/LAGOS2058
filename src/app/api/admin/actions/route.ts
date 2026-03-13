import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const turn = searchParams.get('turn')
  const partyId = searchParams.get('party_id')
  const status = searchParams.get('status')

  const admin = createAdminClient()
  let query = admin
    .from('action_submissions')
    .select('*, parties(name, color)')
    .order('created_at', { ascending: false })

  if (turn) query = query.eq('turn', parseInt(turn))
  if (partyId) query = query.eq('party_id', partyId)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ actions: data, count: data?.length ?? 0 })
}

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id, status, quality_score, gm_notes } = await request.json()
  if (!id) return NextResponse.json({ error: 'Action id required' }, { status: 400 })

  const admin = createAdminClient()
  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (quality_score !== undefined) updates.quality_score = quality_score
  if (gm_notes !== undefined) updates.gm_notes = gm_notes

  const { error } = await admin.from('action_submissions').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
