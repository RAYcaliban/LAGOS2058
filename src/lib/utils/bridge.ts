/**
 * Bridge utilities for converting between site (Supabase) and engine
 * (Python election-engine) data formats.
 *
 * Key differences:
 * - Site uses UUID party_id, engine uses party name strings
 * - Site uses "epo_engagement" / "epo_intelligence", engine uses "eto_*"
 * - Site stores LGA names (strings), engine uses integer indices (0-773)
 * - Site stores AZ codes like "AZ3", engine uses plain integers (3)
 * - Site uses "params" (JSONB), engine uses "parameters" (dict)
 */

import lgaEngineMap from '@/lib/data/lga-engine-map.json'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a single action in the export payload sent to the engine. */
export interface ExportAction {
  party: string
  action_type: string
  target_lgas: number[] | null
  target_azs: number[] | null
  target_districts: string[] | null
  target_party: string | null
  language: string
  parameters: Record<string, unknown>
  description: string
  gm_score: number | null
  site_action_id: string
}

/** The full export payload (site -> engine). */
export interface ActionsExportPayload {
  turn: number
  actions: ExportAction[]
  crises: unknown[]
}

/** A Supabase action_submissions row. */
export interface ActionRow {
  id: string
  party_id: string
  turn: number
  action_type: string
  params: Record<string, unknown> | null
  target_lgas: string[] | null
  target_azs: string[] | null
  language: string
  pc_cost: number
  quality_score: number | null
  status: string
  description: string
  gm_notes: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// Action type mapping (site ↔ engine)
// ---------------------------------------------------------------------------

const SITE_TO_ENGINE_ACTION_TYPES: Record<string, string> = {
  epo_engagement: 'eto_engagement',
  epo_intelligence: 'eto_intelligence',
}

const ENGINE_TO_SITE_ACTION_TYPES: Record<string, string> = {
  eto_engagement: 'epo_engagement',
  eto_intelligence: 'epo_intelligence',
}

/** Map a site action type to the engine equivalent. */
export function mapActionTypeToEngine(type: string): string {
  return SITE_TO_ENGINE_ACTION_TYPES[type] ?? type
}

/** Map an engine action type back to the site equivalent. */
export function mapActionTypeFromEngine(type: string): string {
  return ENGINE_TO_SITE_ACTION_TYPES[type] ?? type
}

// ---------------------------------------------------------------------------
// LGA name → engine index
// ---------------------------------------------------------------------------

const lgaMap = lgaEngineMap as Record<string, number>

/** Convert an LGA name to its engine index (0-773). Returns null if not found. */
export function lgaNameToIndex(name: string): number | null {
  return lgaMap[name] ?? null
}

/** Convert LGA names to engine indices, skipping any that can't be resolved. */
export function lgaNamesToIndices(names: string[]): number[] {
  const indices: number[] = []
  for (const name of names) {
    const idx = lgaNameToIndex(name)
    if (idx !== null) indices.push(idx)
  }
  return indices
}

// Build reverse map lazily
let _indexToName: Record<number, string> | null = null

function getIndexToNameMap(): Record<number, string> {
  if (!_indexToName) {
    _indexToName = {}
    for (const [name, idx] of Object.entries(lgaMap)) {
      // Skip disambiguated entries like "Surulere (Oyo)" if the plain name
      // already claimed this index — prefer the shorter name.
      if (name.includes('(') && _indexToName[idx] !== undefined) continue
      _indexToName[idx] = name
    }
  }
  return _indexToName
}

/** Convert an engine LGA index back to its name. */
export function lgaIndexToName(index: number): string | null {
  return getIndexToNameMap()[index] ?? null
}

// ---------------------------------------------------------------------------
// AZ code → integer
// ---------------------------------------------------------------------------

/** Parse an AZ code like "AZ3" to the integer 3. */
export function azCodeToInt(code: string): number {
  const match = code.match(/^AZ(\d+)$/i)
  return match ? parseInt(match[1], 10) : parseInt(code, 10)
}

/** Convert AZ codes array to integer array. */
export function azCodesToInts(codes: string[]): number[] {
  return codes.map(azCodeToInt).filter((n) => !isNaN(n))
}

/** Convert an AZ integer back to "AZ3" format. */
export function azIntToCode(az: number): string {
  return `AZ${az}`
}

// ---------------------------------------------------------------------------
// Transform: site action row → export object
// ---------------------------------------------------------------------------

/**
 * Convert a Supabase action_submissions row into the engine's ActionInput
 * format for export.
 */
export function transformSiteActionToExport(
  action: ActionRow,
  partyName: string
): ExportAction {
  const engineType = mapActionTypeToEngine(action.action_type)
  const params = { ...(action.params ?? {}) }

  // Move quality_score into parameters as gm_score
  if (action.quality_score != null) {
    params.gm_score = action.quality_score
  }

  // Convert target LGA names to indices
  const targetLgas =
    action.target_lgas && action.target_lgas.length > 0
      ? lgaNamesToIndices(action.target_lgas)
      : null

  // Convert AZ codes to integers
  const targetAzs =
    action.target_azs && action.target_azs.length > 0
      ? azCodesToInts(action.target_azs)
      : null

  // Extract district from params if present
  const targetDistricts = params.district
    ? [String(params.district)]
    : null

  // Extract target_party from params if present
  const targetParty = params.target_party
    ? String(params.target_party)
    : null

  // Rename issue_dimensions → dimensions (engine reads "dimensions")
  if ('issue_dimensions' in params) {
    params.dimensions = params.issue_dimensions
    delete params.issue_dimensions
  }

  return {
    party: partyName,
    action_type: engineType,
    target_lgas: targetLgas,
    target_azs: targetAzs,
    target_districts: targetDistricts,
    target_party: targetParty,
    language: action.language,
    parameters: params,
    description: action.description,
    gm_score: action.quality_score,
    site_action_id: action.id,
  }
}

// ---------------------------------------------------------------------------
// Transform: engine result → site import format
// ---------------------------------------------------------------------------

/**
 * Convert the engine's TurnResultResponse into the format expected by
 * the site's /api/results/import endpoint.
 *
 * @param result - The engine's TurnResultResponse JSON
 * @param partyMap - Map of party name → party_id (UUID)
 * @param actionIdMap - Map of site_action_id → original action row ID (for marking processed)
 */
export function transformEngineResultToImport(
  result: Record<string, unknown>,
  partyMap: Record<string, string>,
  actionIdMap?: Record<string, string>
) {
  const state = result.state as Record<string, unknown> | undefined
  const partyStatuses = (state?.party_statuses as Record<string, unknown>[]) ?? []

  // Extract poll_results from engine state (flat list with commissioned_by)
  // and group by party name so each party only sees their own polls.
  const allPollResults = (state?.poll_results as Record<string, unknown>[]) ?? []
  const pollsByParty: Record<string, Record<string, unknown>[]> = {}
  for (const poll of allPollResults) {
    const by = poll.commissioned_by as string
    if (!pollsByParty[by]) pollsByParty[by] = []
    pollsByParty[by].push(poll)
  }

  // Build party_states for upsert
  const partyStates = partyStatuses
    .map((ps) => {
      const name = ps.name as string
      const partyId = partyMap[name]
      if (!partyId) return null
      return {
        party_id: partyId,
        pc: ps.pc as number,
        cohesion: ps.cohesion as number,
        exposure: ps.exposure as number,
        momentum: Math.round(ps.momentum as number),
        vote_share: ps.vote_share as number,
        seats: Math.round(ps.seats as number),
        awareness: ps.awareness as number,
        epo_scores: ps.eto_score,
        poll_results: pollsByParty[name] ?? null,
      }
    })
    .filter(Boolean)

  // Build game_state update
  // Note: do NOT set `phase` from engine — the engine returns campaign phase
  // names like "Foundation" / "Expansion", but the site's game_state.phase is
  // a workflow status ("submission" / "resolution" / "results") with a DB check
  // constraint. Store the engine phase inside national_results instead.
  const gameState: Record<string, unknown> = {
    lga_results: result.lga_results,
    national_results: {
      vote_shares: result.national_vote_shares,
      turnout: result.national_turnout,
      seat_counts: result.seat_counts,
      total_seats: result.total_seats,
      engine_phase: state?.phase,
    },
  }

  // Build action updates (mark as processed)
  const actionsResolved = (result.actions_resolved as Record<string, unknown>[]) ?? []
  const actionUpdates = actionsResolved
    .map((ar) => {
      const siteId = ar.site_action_id as string | undefined
      const id = siteId ?? (actionIdMap ? actionIdMap[siteId ?? ''] : undefined)
      if (!id) return null
      return {
        id,
        quality_score: ar.gm_score ?? ar.quality_score ?? null,
        gm_notes: ar.notes ?? null,
      }
    })
    .filter(Boolean)

  return {
    turn: result.turn as number,
    party_states: partyStates,
    game_state: gameState,
    action_updates: actionUpdates,
  }
}
