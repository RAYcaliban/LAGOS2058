import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()

  // approved column added by migration 00016 — select all and cast
  const { data: pages, error } = await admin
    .from('wiki_pages')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ pages: pages ?? [] })
}

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id, approved } = await request.json()
  if (!id || typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'id and approved boolean required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Use raw rpc or manual update since approved isn't in generated types
  const updateFields: Record<string, unknown> = {
    approved,
    approved_by: approved ? auth.userId : null,
  }

  const { error } = await admin
    .from('wiki_pages')
    .update(updateFields as never)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
