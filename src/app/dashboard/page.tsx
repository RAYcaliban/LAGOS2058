import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FixedWidthContainer } from '@/components/layout/FixedWidthContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PartyHeader } from '@/components/dashboard/PartyHeader'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { EPOScoresTable } from '@/components/dashboard/EPOScoresTable'
import { ActionHistory } from '@/components/dashboard/ActionHistory'
import { PollResults } from '@/components/dashboard/PollResults'
import { ScandalHistory } from '@/components/dashboard/ScandalHistory'
import { CharacterCard } from '@/components/dashboard/CharacterCard'
import { NoPartyPrompt } from '@/components/dashboard/NoPartyPrompt'
import { ReadOnlyPartyBrowser } from '@/components/party/ReadOnlyPartyBrowser'
import { PartyWikiPages } from '@/components/dashboard/PartyWikiPages'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, parties!profiles_party_id_fkey(*)')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (!profile.character_name) redirect('/character/create')

  // No party — show character card + no-party prompt instead of redirecting
  if (!profile.party_id) {
    return (
      <>
        <PageHeader
          title="DASHBOARD"
          label="Campaign HQ"
          image="/images/afrofuture.jpg"
          wash="teal"
          subtitle="Your command centre. Join or create a party to begin campaigning."
        />
        <FixedWidthContainer className="py-6 space-y-6">
          <CharacterCard
            characterName={profile.character_name}
            ethnicity={profile.ethnicity}
            religion={profile.religion_display ?? profile.religion}
            bio={profile.bio}
          />
          <NoPartyPrompt />
        </FixedWidthContainer>
      </>
    )
  }

  // Get latest game state
  const { data: gameState } = await supabase
    .from('game_state')
    .select('*')
    .order('turn', { ascending: false })
    .limit(1)
    .single()

  // Check if election results have been revealed by admin
  const { data: resultsConfig } = await supabase
    .from('game_config')
    .select('value')
    .eq('key', 'results_released')
    .maybeSingle()
  const resultsReleased = resultsConfig?.value === true

  // Get party state for latest turn
  const currentTurn = gameState?.turn ?? 1
  const { data: partyState } = await supabase
    .from('party_state')
    .select('*')
    .eq('party_id', profile.party_id)
    .eq('turn', currentTurn)
    .single()

  // Get party info
  const { data: party } = await supabase
    .from('parties')
    .select('*')
    .eq('id', profile.party_id)
    .single()

  // Get party wiki pages
  const { data: wikiPagesData } = await supabase
    .from('wiki_pages')
    .select('slug, title, page_type, updated_at')
    .eq('party_id', profile.party_id)
    .order('updated_at', { ascending: false })
    .limit(10)

  const wikiPages = (wikiPagesData ?? []).map((wp) => ({
    slug: wp.slug,
    title: wp.title,
    pageType: wp.page_type,
    updatedAt: wp.updated_at,
  }))

  return (
    <>
      <PageHeader
        title="DASHBOARD"
        label="Campaign HQ"
        image="/images/afrofuture.jpg"
        wash="teal"
        subtitle={`Turn ${currentTurn} · ${gameState?.phase ?? 'submission'} phase`}
      />
    <FixedWidthContainer className="py-6 space-y-6">
      <PartyHeader
        party={party}
        turn={currentTurn}
        phase={gameState?.phase ?? 'submission'}
        deadline={gameState?.deadline ?? null}
        submissionOpen={gameState?.submission_open ?? false}
      />

      <StatsGrid partyState={partyState} resultsReleased={resultsReleased} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EPOScoresTable epoScores={(partyState?.epo_scores ?? {}) as Record<string, Record<string, number>>} />
        <PollResults pollResults={partyState?.poll_results as Record<string, unknown>[] | null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionHistory actionHistory={(partyState?.action_history ?? []) as Record<string, unknown>[]} />
        <ScandalHistory scandalHistory={(partyState?.scandal_history ?? []) as Record<string, unknown>[]} />
      </div>

      <PartyWikiPages
        pages={wikiPages}
        partyName={party?.name ?? 'your party'}
      />

      <ReadOnlyPartyBrowser />
    </FixedWidthContainer>
    </>
  )
}
