import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/actions/feed — public actions feed.
 * Returns submitted/processed actions, excluding private types.
 * Query params: ?turn=N for turn filtering, ?limit=50
 */

const PRIVATE_ACTION_TYPES = [
  'epo_engagement',
  'epo_intelligence',
  'poll',
  'ethnic_mobilization',
]

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const turn = searchParams.get('turn')
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)

  let query = supabase
    .from('action_submissions')
    .select('id, action_type, turn, description, status, quality_score, party_id, parties(name, full_name, color)')
    .in('status', ['submitted', 'processed'])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (turn) {
    query = query.eq('turn', Number(turn))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter out private action types
  const publicActions = (data ?? []).filter(
    (a) => !PRIVATE_ACTION_TYPES.includes(a.action_type),
  )

  return NextResponse.json({ actions: publicActions })
}
