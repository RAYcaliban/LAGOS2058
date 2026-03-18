import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Get page id from slug
  const { data: page } = await supabase
    .from('wiki_pages')
    .select('id, approved_revision_id')
    .eq('slug', slug)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: revisions, error } = await supabase
    .from('wiki_revisions')
    .select('id, title, revision_number, created_at, edited_by, edit_summary, profiles!wiki_revisions_edited_by_fkey(id, display_name, avatar_url)')
    .eq('wiki_page_id', page.id)
    .order('revision_number', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mapped = (revisions ?? []).map((r) => {
    const editor = r.profiles as { id: string; display_name: string; avatar_url: string | null } | null
    return {
      id: r.id,
      wikiPageId: page.id,
      title: r.title,
      editedBy: editor ? { id: editor.id, displayName: editor.display_name, avatarUrl: editor.avatar_url } : null,
      revisionNumber: r.revision_number,
      createdAt: r.created_at,
      editSummary: r.edit_summary ?? null,
      isApproved: r.id === page.approved_revision_id,
    }
  })

  return NextResponse.json({ revisions: mapped })
}
