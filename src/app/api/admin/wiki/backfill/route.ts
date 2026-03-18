import { NextResponse } from 'next/server'
import { verifyGMAccess } from '@/lib/supabase/admin-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const auth = await verifyGMAccess()
  if (auth.error) return auth.error

  const admin = createAdminClient()

  // Get all parties
  const { data: parties } = await admin
    .from('parties')
    .select('id, name, full_name, color, leader_name, ethnicity, religion_display')

  // Get all characters (profiles with character_name)
  const { data: characters } = await admin
    .from('profiles')
    .select('id, character_name, ethnicity, religion_display, bio, party_id')
    .not('character_name', 'is', null)

  // Get existing wiki slugs
  const { data: existingPages } = await admin
    .from('wiki_pages')
    .select('slug')

  const existingSlugs = new Set((existingPages ?? []).map((p: { slug: string }) => p.slug))

  const toInsert: {
    slug: string
    title: string
    content: string
    party_id: string | null
    page_type: 'party' | 'character'
  }[] = []

  // Party stubs
  for (const party of parties ?? []) {
    const slug = `party-${party.name.toLowerCase().replace(/\s+/g, '-')}`
    if (existingSlugs.has(slug)) continue

    toInsert.push({
      slug,
      title: `${party.full_name} (${party.name})`,
      content: `# ${party.full_name} (${party.name})

## Overview

The **${party.full_name}** is a political party competing in the LAGOS 2058 election.

- **Abbreviation**: ${party.name}
- **Leader**: ${party.leader_name || 'Unknown'}
- **Ethnicity**: ${party.ethnicity || 'Not specified'}
- **Religion**: ${party.religion_display || 'Not specified'}
- **Color**: ${party.color}

## Platform

*Platform details to be added as the campaign progresses.*

## Campaign History

### Turn 1
*No actions yet.*
`,
      party_id: party.id,
      page_type: 'party',
    })
  }

  // Character stubs
  for (const char of characters ?? []) {
    const slug = `character-${(char.character_name as string).toLowerCase().replace(/\s+/g, '-')}`
    if (existingSlugs.has(slug)) continue

    toInsert.push({
      slug,
      title: char.character_name as string,
      content: `# ${char.character_name}

## Biography

**${char.character_name}** is a political figure in the LAGOS 2058 election.

- **Ethnicity**: ${char.ethnicity || 'Not specified'}
- **Religion**: ${char.religion_display || 'Not specified'}

${char.bio ? `## Background\n\n${char.bio}` : '## Background\n\n*Character background to be developed during the campaign.*'}

## Political Positions

*Positions will be updated as manifesto and campaign actions are submitted.*
`,
      party_id: (char.party_id as string) ?? null,
      page_type: 'character',
    })
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ created: { parties: 0, characters: 0 } })
  }

  const { error } = await admin.from('wiki_pages').insert(toInsert)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const partyCount = toInsert.filter((p) => p.page_type === 'party').length
  const charCount = toInsert.filter((p) => p.page_type === 'character').length

  return NextResponse.json({ created: { parties: partyCount, characters: charCount } })
}
