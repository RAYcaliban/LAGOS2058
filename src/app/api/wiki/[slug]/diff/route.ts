import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const revisionId = searchParams.get('revisionId')

  if (!revisionId) {
    return NextResponse.json({ error: 'revisionId is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: page } = await supabase
    .from('wiki_pages')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  const { data: revision, error } = await supabase
    .from('wiki_revisions')
    .select('id, title, content, revision_number, edit_summary')
    .eq('id', revisionId)
    .eq('wiki_page_id', page.id)
    .single()

  if (error || !revision) {
    return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
  }

  return NextResponse.json({ revision })
}
