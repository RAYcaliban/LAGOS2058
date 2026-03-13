import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  // Verify GM/admin role
  const supabase = await createClient()
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

  try {
    const body = await request.json()
    const { turn, party_states, game_state, action_updates } = body

    if (!turn) {
      return NextResponse.json({ error: 'Turn number required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Upsert game state
    if (game_state) {
      const { error } = await admin
        .from('game_state')
        .upsert({ ...game_state, turn }, { onConflict: 'turn' })
      if (error) {
        return NextResponse.json({ error: `Game state: ${error.message}` }, { status: 500 })
      }
    }

    // Upsert party states
    if (party_states && Array.isArray(party_states)) {
      for (const ps of party_states) {
        const { error } = await admin
          .from('party_state')
          .upsert({ ...ps, turn }, { onConflict: 'party_id,turn' })
        if (error) {
          return NextResponse.json({ error: `Party state: ${error.message}` }, { status: 500 })
        }
      }
    }

    // Update action statuses
    if (action_updates && Array.isArray(action_updates)) {
      for (const update of action_updates) {
        const { error } = await admin
          .from('action_submissions')
          .update({
            status: 'processed',
            quality_score: update.quality_score,
            gm_notes: update.gm_notes,
          })
          .eq('id', update.id)
        if (error) {
          return NextResponse.json({ error: `Action update: ${error.message}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ success: true, turn })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
