import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { actionIds } = await request.json()
  if (!actionIds || !Array.isArray(actionIds) || actionIds.length === 0) {
    return NextResponse.json({ error: 'actionIds array required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('action_submissions')
    .update({ status: 'processed' })
    .in('id', actionIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, count: actionIds.length })
}
