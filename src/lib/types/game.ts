/**
 * Game state type definitions for LAGOS 2058.
 *
 * Covers turn phases, EPO (Extra-Partisan Organisation) scoring,
 * per-party stat snapshots, and election result structures.
 */

// ---------------------------------------------------------------------------
// Turn phases
// ---------------------------------------------------------------------------

export type GamePhase = 'submission' | 'resolution' | 'results';

// ---------------------------------------------------------------------------
// EPO (Extra-Partisan Organisation) types
// ---------------------------------------------------------------------------

/** The four EPO categories (matching engine). */
export type EPOCategory = 'economic' | 'labor' | 'elite' | 'youth';

/** Ordered list of EPO categories for iteration. */
export const EPO_CATEGORIES: readonly EPOCategory[] = [
  'economic',
  'labor',
  'elite',
  'youth',
] as const;

/**
 * Issue dimensions (by index) that each EPO category is salient on.
 * Used to display which policy areas matter for each EPO category.
 */
export const EPO_SALIENCE_DIMENSIONS: Record<EPOCategory, readonly number[]> = {
  economic: [7, 18, 19],  // resource_revenue, taxation, agricultural_policy
  labor: [10, 11, 8],     // labor_automation, military_role, housing
  elite: [3, 6, 4],       // bic_reform, constitutional_structure, ethnic_quotas
  youth: [20, 23, 21],    // biological_enhancement, media_freedom, trade_policy
};

/**
 * EPO scores keyed by zone key (e.g. 'AZ1'), then by category.
 *
 * Example:
 * ```ts
 * const scores: EPOScores = {
 *   'AZ1': { economic: 8, labor: 5, elite: 3, youth: 7 },
 *   'AZ2': { economic: 6, labor: 14, elite: 9, youth: 7 },
 * };
 * ```
 */
export type EPOScores = Record<string, Record<EPOCategory, number>>;

// ---------------------------------------------------------------------------
// Party statistics snapshot (one per party per turn)
// ---------------------------------------------------------------------------

export interface PartyStats {
  /** Political Capital — spendable resource pool. */
  pc: number;

  /** Internal party cohesion (0.0 – 1.0). */
  cohesion: number;

  /** Media / public exposure level (0.0 – 1.0). */
  exposure: number;

  /** Campaign momentum — positive or negative trend indicator. */
  momentum: number;

  /** Projected national vote share as a fraction (0.0 – 1.0). */
  voteShare: number;

  /** Number of legislative seats currently held or projected. */
  seats: number;

  /** Voter awareness of the party (0.0 – 1.0). */
  awareness: number;
}

// ---------------------------------------------------------------------------
// LGA-level election result
// ---------------------------------------------------------------------------

export interface LGAResult {
  /** LGA code / identifier. */
  lga: string;

  /** State the LGA belongs to. */
  state: string;

  /** Administrative Zone the LGA falls within. */
  az: string;

  /** Party code of the winning party in this LGA. */
  winner: string;

  /** Voter turnout as a fraction (0.0 – 1.0). */
  turnout: number;

  /** Vote share per party (party code -> fraction). */
  voteShares: Record<string, number>;

  /** Margin of victory as a fraction (0.0 – 1.0). */
  margin: number;
}

// ---------------------------------------------------------------------------
// National-level election results (aggregated)
// ---------------------------------------------------------------------------

export interface NationalResults {
  /** Total number of votes cast (including invalid). */
  totalVotes: number;

  /** Total valid votes counted. */
  validVotes: number;

  /** National vote share per party (party code -> fraction). */
  nationalVoteShares: Record<string, number>;

  /** Seat allocation per party (party code -> seat count). */
  seatAllocation: Record<string, number>;

  /** Effective Number of Parties (Laakso-Taagepera index). */
  enp: number;
}
