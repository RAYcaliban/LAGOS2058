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

/** The four broad categories that EPOs care about. */
export type EPOCategory = 'security' | 'economic' | 'social' | 'political';

/**
 * EPO scores keyed by zone name, then by category.
 *
 * Example:
 * ```ts
 * const scores: EPOScores = {
 *   'lagos-island': { security: 12, economic: 8, social: 5, political: 3 },
 *   'ikeja':        { security: 6,  economic: 14, social: 9, political: 7 },
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
