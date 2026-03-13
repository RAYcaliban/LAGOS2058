import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()
  const { data, error } = await admin.from('game_config').select('*').order('key')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configs: data })
}

export async function POST(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { key, value, description } = await request.json()
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('game_config').insert({ key, value, description })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id, value, description } = await request.json()
  if (!id) return NextResponse.json({ error: 'Config id required' }, { status: 400 })

  const admin = createAdminClient()
  const updates: Record<string, unknown> = {}
  if (value !== undefined) updates.value = value
  if (description !== undefined) updates.description = description

  const { error } = await admin.from('game_config').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Config id required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('game_config').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
