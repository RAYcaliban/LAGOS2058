import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const turn = searchParams.get('turn')

  const supabase = await createClient()

  // Check if user is GM/admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'gm' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch submitted actions for the specified turn
  let query = supabase
    .from('action_submissions')
    .select('*')
    .eq('status', 'submitted')

  if (turn) {
    query = query.eq('turn', parseInt(turn))
  }

  const { data: actions, error } = await query.order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ actions, count: actions?.length ?? 0 })
}
