import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugifyTitle } from '@/lib/utils/slugify'

const VALID_PAGE_TYPES = ['party', 'character', 'event', 'lore', 'general', 'organization', 'location', 'institution']

function sanitizeSearch(input: string): string {
  return input.slice(0, 200).replace(/%/g, '\\%').replace(/_/g, '\\_')
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const rawSearch = searchParams.get('search')
  const search = rawSearch ? sanitizeSearch(rawSearch) : null
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const offset = (page - 1) * limit

  let query = supabase
    .from('wiki_pages')
    .select('id, slug, title, page_type, party_id, updated_at, parties(name, color)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type && VALID_PAGE_TYPES.includes(type)) {
    query = query.eq('page_type', type)
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pages = (data ?? []).map((row) => {
    const party = row.parties as { name: string; color: string | null } | null
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      pageType: row.page_type,
      partyId: row.party_id,
      partyName: party?.name ?? null,
      partyColor: party?.color ?? null,
      updatedAt: row.updated_at,
    }
  })

  const total = count ?? pages.length
  return NextResponse.json({
    pages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, pageType, partyId, editSummary, infoboxData } = await request.json()

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (pageType && !VALID_PAGE_TYPES.includes(pageType)) {
    return NextResponse.json({ error: 'Invalid page type' }, { status: 400 })
  }

  const slug = slugifyTitle(title)

  if (!slug) {
    return NextResponse.json({ error: 'Title must contain at least one alphanumeric character' }, { status: 400 })
  }

  const admin = createAdminClient()
  const articleContent = content?.trim() || `# ${title.trim()}\n\n*This article is a stub. You can help by expanding it.*`

  // Insert page — use select('*') so we can detect if infobox_data column exists
  const { data: page, error } = await admin
    .from('wiki_pages')
    .insert({
      slug,
      title: title.trim(),
      content: articleContent,
      page_type: pageType || 'general',
      party_id: partyId || null,
      last_edited_by: user.id,
      approved: false,
    })
    .select('*')
    .single()

  if (error) {
    // Handle unique constraint violation on slug
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An article with a similar title already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const dbHasInfobox = 'infobox_data' in page

  // Create initial revision
  if (page) {
    const { data: rev } = await admin.from('wiki_revisions').insert({
      wiki_page_id: page.id,
      title: title.trim(),
      content: articleContent,
      edited_by: user.id,
      edit_summary: editSummary?.trim() || 'Initial creation',
      revision_number: 1,
    }).select('id').single()

    // Only write infobox_data if the column actually exists in the DB (confirmed by select('*'))
    if (infoboxData && dbHasInfobox) {
      await admin.from('wiki_pages').update({ infobox_data: infoboxData }).eq('id', page.id)
      if (rev) {
        await admin.from('wiki_revisions').update({ infobox_data: infoboxData }).eq('id', rev.id)
      }
    }
  }

  return NextResponse.json({ slug: page.slug })
}
