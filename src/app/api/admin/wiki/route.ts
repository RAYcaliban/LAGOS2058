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

  let approvedRevisionId: string | null = null

  if (approved) {
    // Find the latest revision for this page and set it as the approved revision
    const { data: latestRev } = await admin
      .from('wiki_revisions')
      .select('id')
      .eq('wiki_page_id', id)
      .order('revision_number', { ascending: false })
      .limit(1)
      .single()

    approvedRevisionId = latestRev?.id ?? null
  }

  const { error } = await admin
    .from('wiki_pages')
    .update({
      approved,
      approved_by: approved ? auth.userId : null,
      approved_revision_id: approvedRevisionId,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
