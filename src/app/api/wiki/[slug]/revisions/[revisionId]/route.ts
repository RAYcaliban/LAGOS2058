import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; revisionId: string }> }
) {
  const { revisionId } = await params
  const supabase = await createClient()

  const { data: revision, error } = await supabase
    .from('wiki_revisions')
    .select('id, wiki_page_id, title, content, revision_number, created_at, edited_by, profiles!wiki_revisions_edited_by_fkey(id, display_name, avatar_url)')
    .eq('id', revisionId)
    .single()

  if (error || !revision) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const editor = revision.profiles as { id: string; display_name: string; avatar_url: string | null } | null

  return NextResponse.json({
    revision: {
      id: revision.id,
      wikiPageId: revision.wiki_page_id,
      title: revision.title,
      content: revision.content,
      editedBy: editor ? { id: editor.id, displayName: editor.display_name, avatarUrl: editor.avatar_url } : null,
      revisionNumber: revision.revision_number,
      createdAt: revision.created_at,
    },
  })
}
