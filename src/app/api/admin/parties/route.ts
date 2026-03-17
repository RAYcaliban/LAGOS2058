import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()

  // Get parties
  const { data: parties, error } = await admin
    .from('parties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get member counts and owner names
  const enriched = await Promise.all(
    (parties ?? []).map(async (party) => {
      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('party_id', party.id)

      let ownerName: string | null = null
      if (party.owner_id) {
        const { data: owner } = await admin
          .from('profiles')
          .select('display_name')
          .eq('id', party.owner_id)
          .single()
        ownerName = owner?.display_name ?? null
      }

      return { ...party, member_count: count ?? 0, owner_name: ownerName }
    })
  )

  return NextResponse.json({ parties: enriched })
}

export async function PATCH(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id, ...fields } = await request.json()
  if (!id) return NextResponse.json({ error: 'Party id required' }, { status: 400 })

  const admin = createAdminClient()
  const { error } = await admin.from('parties').update(fields).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Party id required' }, { status: 400 })

  const admin = createAdminClient()

  // Remove all members from the party
  const { error: memberError } = await admin
    .from('profiles')
    .update({ party_id: null })
    .eq('party_id', id)
  if (memberError) return NextResponse.json({ error: memberError.message }, { status: 500 })

  // Delete the party
  const { error } = await admin.from('parties').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/dashboard')
  revalidatePath('/party')

  return NextResponse.json({ success: true })
}
