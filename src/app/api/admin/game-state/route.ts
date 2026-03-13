import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('game_state')
    .select('*')
    .order('turn', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const body = await request.json()
  const { id, ...fields } = body
  if (!id) return NextResponse.json({ error: 'Game state id required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('game_state').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
