import { createAdminClient } from '@/lib/supabase/admin'

let _exists: boolean | null = null

/**
 * Checks (once, then caches) whether the infobox_data column exists
 * on wiki_pages. Returns false pre-migration so we never send
 * infobox_data to PostgREST when the column isn't there.
 */
export async function hasInfoboxColumn(): Promise<boolean> {
  if (_exists !== null) return _exists
  const admin = createAdminClient()
  const { error } = await admin.from('wiki_pages').select('infobox_data').limit(0)
  _exists = !error
  return _exists
}
