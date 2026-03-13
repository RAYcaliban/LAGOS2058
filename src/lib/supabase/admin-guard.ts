import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Verify the current user has GM or admin role.
 * Returns the userId on success, or an error NextResponse on failure.
 */
export async function verifyGMAccess(): Promise<
  { userId: string; error?: never } | { error: NextResponse; userId?: never }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'gm' && profile.role !== 'admin')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { userId: user.id }
}
