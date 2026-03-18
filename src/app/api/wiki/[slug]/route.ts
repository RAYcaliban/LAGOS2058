import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wiki_pages')
    .select('*, parties(name, full_name, color, leader_name, ethnicity, religion_display), profiles!wiki_pages_last_edited_by_fkey(id, display_name, avatar_url)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const party = data.parties as { name: string; full_name: string; color: string | null; leader_name: string | null; ethnicity: string | null; religion_display: string | null } | null
  const editor = data.profiles as { id: string; display_name: string; avatar_url: string | null } | null

  const page = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content,
    partyId: data.party_id,
    partyName: party?.name ?? null,
    partyFullName: party?.full_name ?? null,
    partyColor: party?.color ?? null,
    partyLeaderName: party?.leader_name ?? null,
    partyEthnicity: party?.ethnicity ?? null,
    partyReligion: party?.religion_display ?? null,
    pageType: data.page_type,
    lastEditedBy: editor ? { id: editor.id, displayName: editor.display_name, avatarUrl: editor.avatar_url } : null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    approved: data.approved ?? false,
    approvedRevisionId: data.approved_revision_id ?? null,
  }

  return NextResponse.json({ page })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current page
  const { data: page, error: pageError } = await supabase
    .from('wiki_pages')
    .select('id, party_id, page_type, approved')
    .eq('slug', slug)
    .single()

  if (pageError || !page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Permission check is enforced by RLS on wiki_pages update policy
  const { title, content, editSummary } = await request.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get next revision number
  const { data: maxRev } = await admin
    .from('wiki_revisions')
    .select('revision_number')
    .eq('wiki_page_id', page.id)
    .order('revision_number', { ascending: false })
    .limit(1)
    .single()

  const nextRevision = (maxRev?.revision_number ?? 0) + 1

  // Insert revision
  const { data: revision, error: revError } = await admin
    .from('wiki_revisions')
    .insert({
      wiki_page_id: page.id,
      title,
      content,
      edited_by: user.id,
      revision_number: nextRevision,
      edit_summary: editSummary?.trim() || null,
    })
    .select('id')
    .single()

  if (revError) {
    return NextResponse.json({ error: revError.message }, { status: 500 })
  }

  // Update wiki page — use user's client so RLS enforces permissions
  const updateFields: Record<string, unknown> = {
    title,
    content,
    last_edited_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // If was previously approved, mark as unapproved but keep the approved_revision_id
  if (page.approved) {
    updateFields.approved = false
  }

  const { error: updateError } = await supabase
    .from('wiki_pages')
    .update(updateFields)
    .eq('id', page.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, revisionId: revision.id })
}
