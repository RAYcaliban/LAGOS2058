import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Player id required' }, { status: 400 })

  const admin = createAdminClient()

  // Nullify party_id to avoid FK constraint issues
  const { error: unlinkError } = await admin
    .from('profiles')
    .update({ party_id: null })
    .eq('id', id)
  if (unlinkError) return NextResponse.json({ error: unlinkError.message }, { status: 500 })

  // Delete the profile row
  const { error: profileError } = await admin.from('profiles').delete().eq('id', id)
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  // Delete the Supabase auth user
  const { error: authError } = await admin.auth.admin.deleteUser(id)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
