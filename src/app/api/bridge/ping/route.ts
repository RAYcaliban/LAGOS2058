import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/bridge/ping
 * Check if the engine API is reachable. GM/admin only.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || (profile.role !== 'gm' && profile.role !== 'admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const engineUrl = body.engine_url || process.env.ENGINE_API_URL || 'http://localhost:8000'

    const res = await fetch(`${engineUrl}/api/campaign/state`, {
      signal: AbortSignal.timeout(5000),
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({
        online: true,
        turn: data?.turn ?? null,
        phase: data?.phase ?? null,
      })
    }

    return NextResponse.json({ online: false, status: res.status })
  } catch {
    return NextResponse.json({ online: false })
  }
}
