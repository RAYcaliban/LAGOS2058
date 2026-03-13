import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/lib/types/database'

export async function GET() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('game_state')
    .select('announcements, turn')
    .order('turn', { ascending: false })
    .limit(1)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    announcements: (data?.announcements as Json[]) ?? [],
    turn: data?.turn ?? 0,
  })
}

export async function POST(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { title, content, turn } = await request.json()
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get current game state
  const { data: gs, error: fetchError } = await admin
    .from('game_state')
    .select('id, announcements')
    .order('turn', { ascending: false })
    .limit(1)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const existing = (gs?.announcements as Json[]) ?? []
  const newAnnouncement: Json = {
    id: crypto.randomUUID(),
    title,
    content,
    turn: turn ?? undefined,
    created_at: new Date().toISOString(),
  }

  const updated: Json = [...existing, newAnnouncement]
  const { error } = await admin
    .from('game_state')
    .update({ announcements: updated })
    .eq('id', gs!.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, announcement: newAnnouncement })
}

export async function DELETE(request: Request) {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const { announcementId } = await request.json()
  if (!announcementId) return NextResponse.json({ error: 'announcementId required' }, { status: 400 })

  const admin = createAdminClient()

  const { data: gs, error: fetchError } = await admin
    .from('game_state')
    .select('id, announcements')
    .order('turn', { ascending: false })
    .limit(1)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const existing = (gs?.announcements as Array<{ id: string } & Json>) ?? []
  const filtered: Json = existing.filter((a) => a.id !== announcementId)

  const { error } = await admin
    .from('game_state')
    .update({ announcements: filtered })
    .eq('id', gs!.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
