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

      {isOwner && (
        <ActionBuilder
          partyId={profile.party_id}
          turn={currentTurn}
          pcAvailable={pcAvailable}
          totalPCSpent={totalPCSpent}
          onActionCreated={refetch}
        />
      )}

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
