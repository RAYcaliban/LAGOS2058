'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { ActionBuilder } from '@/components/actions/ActionBuilder'
import { ActionQueue } from '@/components/actions/ActionQueue'
import { TurnContextBar } from '@/components/actions/TurnContextBar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameState } from '@/lib/hooks/useGameState'
import { useActions } from '@/lib/hooks/useActions'
import { usePartyState } from '@/lib/hooks/usePartyState'
import { useParty } from '@/lib/hooks/useParty'

function ActionsContent() {
  const { user, profile } = useAuth()
  const { gameState } = useGameState()
  const { partyState } = usePartyState(profile?.party_id)
  const { isOwner } = useParty(profile?.party_id, user?.id)
  const currentTurn = gameState?.turn ?? 1
  const { actions, totalPCSpent, refetch } = useActions(profile?.party_id, currentTurn)

  const pcAvailable = partyState?.pc ?? 7

  if (!profile?.party_id) {
    return (
      <FixedWidthContainer className="py-10">
        <div className="text-center text-text-secondary">
          <p>You need to join a party before submitting actions.</p>
          <a href="/party" className="text-aero-400 hover:underline mt-2 inline-block">
            Browse Parties
          </a>
        </div>
      </FixedWidthContainer>
    )
  }

  return (
    <FixedWidthContainer className="py-6 space-y-6">
      <TurnContextBar
        turn={currentTurn}
        deadline={gameState?.deadline ?? null}
        submissionOpen={gameState?.submission_open ?? false}
        pcAvailable={pcAvailable}
        pcSpent={totalPCSpent}
      />

      {/* D5: Action fatigue warnings */}
      {actions.length >= 4 && (
        <div className="rounded border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
          You have {actions.length} actions this turn. More than 4 actions may reduce overall quality scores.
        </div>
      )}
      {(() => {
        const typeCounts = actions.reduce<Record<string, number>>((acc, a) => {
          acc[a.action_type] = (acc[a.action_type] || 0) + 1
          return acc
        }, {})
        const dupes = Object.entries(typeCounts).filter(([, c]) => c > 1)
        if (dupes.length === 0) return null
        return (
          <div className="rounded border border-parchment-500/30 bg-parchment-500/5 px-3 py-2 text-xs text-parchment-500">
            Duplicate action types this turn: {dupes.map(([t, c]) => `${t.replace(/_/g, ' ')} (x${c})`).join(', ')}
          </div>
        )
      })()}

      <ActionBuilder
        partyId={profile.party_id}
        turn={currentTurn}
        pcAvailable={pcAvailable}
        totalPCSpent={totalPCSpent}
        onActionCreated={refetch}
        submissionOpen={(gameState?.submission_open ?? false) && isOwner}
      />

      <ActionQueue
        actions={actions}
        totalPCSpent={totalPCSpent}
        pcAvailable={pcAvailable}
        submissionOpen={gameState?.submission_open ?? false}
        onRefetch={refetch}
        readOnly={!isOwner}
      />
    </FixedWidthContainer>
  )
}

export default function ActionsPage() {
  return (
    <AuthGuard requireParty>
      <ActionsContent />
    </AuthGuard>
  )
}
