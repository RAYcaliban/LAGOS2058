import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabase = createAdminClient()

    // Character-only wiki stub (no party yet)
    if (body.characterOnly) {
      const { characterName, ethnicity, religion, bio, slug } = body

      if (!characterName || !slug) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const characterContent = `# ${characterName}

## Biography

**${characterName}** is a political figure in the LAGOS 2058 election.

- **Ethnicity**: ${ethnicity || 'Not specified'}
- **Religion**: ${religion || 'Not specified'}

${bio ? `## Background\n\n${bio}` : '## Background\n\n*Character background to be developed during the campaign.*'}

## Political Positions

*Positions will be updated as manifesto and campaign actions are submitted.*
`

      const { error } = await supabase.from('wiki_pages').insert({
        slug: `character-${slug}`,
        title: characterName,
        content: characterContent,
        party_id: null,
        page_type: 'character',
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, pages: [`character-${slug}`] })
    }

    // Party + leader wiki stubs (original flow)
    const { partyId, partyName, fullName, leaderName, color, ethnicity, religion } = body

    if (!partyId || !partyName || !fullName || !leaderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const partySlug = partyName.toLowerCase().replace(/\s+/g, '-')
    const leaderSlug = leaderName.toLowerCase().replace(/\s+/g, '-')

    // Party wiki page
    const partyContent = `# ${fullName} (${partyName})

## Overview

The **${fullName}** is a political party competing in the LAGOS 2058 election.

- **Abbreviation**: ${partyName}
- **Leader**: ${leaderName}
- **Ethnicity**: ${ethnicity || 'Not specified'}
- **Religion**: ${religion || 'Not specified'}
- **Color**: ${color}

## Platform

*Platform details to be added as the campaign progresses.*

## Campaign History

### Turn 1
*No actions yet.*
`

    // Leader character wiki page
    const leaderContent = `# ${leaderName}

## Biography

**${leaderName}** is the leader of the **${fullName}** (${partyName}).

## Background

*Character background to be developed during the campaign.*

## Political Positions

*Positions will be updated as manifesto and campaign actions are submitted.*
`

    const pages = [
      {
        slug: `party-${partySlug}`,
        title: `${fullName} (${partyName})`,
        content: partyContent,
        party_id: partyId,
        page_type: 'party' as const,
      },
      {
        slug: `character-${leaderSlug}`,
        title: leaderName,
        content: leaderContent,
        party_id: partyId,
        page_type: 'character' as const,
      },
    ]

    const { error } = await supabase.from('wiki_pages').insert(pages)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, pages: pages.map((p) => p.slug) })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
