import { createClient } from '@/lib/supabase/server'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { AeroPanel } from '@/components/ui/AeroPanel'
import { PageHeader } from '@/components/layout/PageHeader'

const PRIVATE_ACTION_TYPES = [
  'epo_engagement',
  'epo_intelligence',
  'poll',
  'ethnic_mobilization',
]

function humanizeActionType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-success'
  if (score >= 5) return 'text-aero-400'
  if (score >= 3) return 'text-parchment-500'
  return 'text-danger'
}

interface FeedAction {
  id: string
  action_type: string
  turn: number
  description: string | null
  status: string
  quality_score: number | null
  parties: { name: string; full_name: string; color: string | null } | null
}

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: gameConfig } = await supabase
    .from('game_config')
    .select('value')
    .eq('key', 'current_turn')
    .single()

  const currentTurn = (gameConfig?.value as number) ?? 1

  const { data } = await supabase
    .from('action_submissions')
    .select('id, action_type, turn, description, status, quality_score, party_id, parties(name, full_name, color)')
    .in('status', ['submitted', 'processed'])
    .order('turn', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  const actions = ((data ?? []) as unknown as FeedAction[]).filter(
    (a) => !PRIVATE_ACTION_TYPES.includes(a.action_type),
  )

  // Group by turn
  const byTurn: Record<number, FeedAction[]> = {}
  for (const a of actions) {
    if (!byTurn[a.turn]) byTurn[a.turn] = []
    byTurn[a.turn].push(a)
  }
  const turns = Object.keys(byTurn)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <>
      <PageHeader
        title="PUBLIC FEED"
        label={`Turn ${currentTurn} · Campaign Actions`}
        image="/images/skyline.jpg"
        wash="teal"
        subtitle="Showing public campaign actions across all parties."
      />
    <FixedWidthContainer className="py-6 space-y-6">

      {actions.length === 0 ? (
        <AeroPanel>
          <p className="text-sm text-text-secondary">No public actions to display yet.</p>
        </AeroPanel>
      ) : (
        turns.map((turn) => (
          <div key={turn}>
            <h2 className="text-xs uppercase tracking-widest text-text-muted mb-2">
              Turn {turn}
            </h2>
            <div className="space-y-2">
              {byTurn[turn].map((action) => (
                <AeroPanel key={action.id}>
                  <div className="flex items-start gap-3">
                    {/* Party color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: action.parties?.color ?? '#4fd1c5' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {action.parties?.name ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-aero-500/10 text-aero-400 uppercase tracking-wider">
                          {humanizeActionType(action.action_type)}
                        </span>
                        {action.status === 'processed' && action.quality_score != null && (
                          <span className={`text-xs font-mono font-semibold ${scoreColor(action.quality_score)}`}>
                            Q{action.quality_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                      {action.description && (
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>
                </AeroPanel>
              ))}
            </div>
          </div>
        ))
      )}
    </FixedWidthContainer>
    </>
  )
}
