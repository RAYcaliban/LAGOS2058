'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { ActionBuilder } from '@/components/actions/ActionBuilder'
import { ActionQueue } from '@/components/actions/ActionQueue'
import { TurnContextBar } from '@/components/actions/TurnContextBar'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameState } from '@/lib/hooks/useGameState'
import { useActions } from '@/lib/hooks/useActions'
import { usePartyState } from '@/lib/hooks/usePartyState'

function ActionsContent() {
  const { profile } = useAuth()
  const { gameState } = useGameState()
  const { partyState } = usePartyState(profile?.party_id)
  const currentTurn = gameState?.turn ?? 1
  const { actions, totalPCSpent, refetch } = useActions(profile?.party_id, currentTurn)

  const pcAvailable = partyState?.pc ?? 7

  if (!profile?.party_id) {
    return (
      <FixedWidthContainer className="py-10">
        <div className="text-center text-text-secondary">
          <p>You need to register a party before submitting actions.</p>
          <a href="/party/register" className="text-aero-400 hover:underline mt-2 inline-block">
            Register a Party
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

      <ActionBuilder
        partyId={profile.party_id}
        turn={currentTurn}
        pcAvailable={pcAvailable}
        totalPCSpent={totalPCSpent}
        onActionCreated={refetch}
      />

      <ActionQueue
        actions={actions}
        totalPCSpent={totalPCSpent}
        pcAvailable={pcAvailable}
        submissionOpen={gameState?.submission_open ?? false}
        onRefetch={refetch}
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
