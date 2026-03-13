import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const body = await request.json()
  const { party_id, turn, action_type, params, target_lgas, target_azs, language, description, pc_cost } = body

  if (!party_id || !turn || !action_type) {
    return NextResponse.json({ error: 'party_id, turn, and action_type required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await admin.from('action_submissions').insert({
    party_id,
    turn,
    action_type,
    params: params ?? {},
    target_lgas: target_lgas ?? null,
    target_azs: target_azs ?? null,
    language: language ?? 'english',
    description: description ?? '',
    pc_cost: pc_cost ?? 0,
    status: 'draft',
  } as any)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
