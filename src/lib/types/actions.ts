/**
 * Action-related type definitions for LAGOS 2058.
 *
 * Covers the 14 campaign action types, targeting scopes, endorser
 * categories, language options, and the draft payload shape used by the
 * action submission UI.
 */

// ---------------------------------------------------------------------------
// Action type union — all 14 available campaign actions
// ---------------------------------------------------------------------------

export type ActionType =
  | 'rally'
  | 'advertising'
  | 'ground_game'
  | 'media'
  | 'endorsement'
  | 'patronage'
  | 'ethnic_mobilization'
  | 'epo_engagement'
  | 'opposition_research'
  | 'crisis_response'
  | 'manifesto'
  | 'fundraising'
  | 'poll'
  | 'epo_intelligence';

// ---------------------------------------------------------------------------
// Targeting
// ---------------------------------------------------------------------------

/** Granularity at which an action can be targeted. */
export type ActionTargetScope = 'district' | 'lga' | 'regional' | 'none';

// ---------------------------------------------------------------------------
// Workflow status
// ---------------------------------------------------------------------------

export type ActionStatus = 'draft' | 'submitted' | 'processed' | 'rejected';

// ---------------------------------------------------------------------------
// Endorsement sub-types
// ---------------------------------------------------------------------------

export type EndorserType =
  | 'traditional_ruler'
  | 'religious_leader'
  | 'epo_leader'
  | 'celebrity'
  | 'notable';

// ---------------------------------------------------------------------------
// Campaign language options
// ---------------------------------------------------------------------------

export type CampaignLanguage =
  | 'english'
  | 'hausa'
  | 'yoruba'
  | 'igbo'
  | 'arabic'
  | 'pidgin'
  | 'mandarin';

// ---------------------------------------------------------------------------
// Advertising mediums
// ---------------------------------------------------------------------------

export type AdvertisingMedium = 'radio' | 'tv' | 'internet';

// ---------------------------------------------------------------------------
// Action draft — the payload shape constructed by the submission form
// ---------------------------------------------------------------------------

export interface ActionDraft {
  /** Which of the 14 action types this draft represents. */
  type: ActionType;

  /**
   * Free-form parameter bag whose keys depend on `type`.
   * For example a `rally` action might include `{ size: 'large' }`,
   * while `advertising` includes `{ medium: 'radio' }`.
   */
  params: Record<string, unknown>;

  /** LGA codes this action targets (may be empty for non-geographic actions). */
  targetLgas: string[];

  /** Administrative Zone codes this action targets. */
  targetAzs: string[];

  /** Language the campaign material is delivered in. */
  language: CampaignLanguage;

  /** Free-text description / flavour text written by the player. */
  description: string;

  /** Political Capital cost calculated for this action. */
  pcCost: number;
}

// ---------------------------------------------------------------------------
// Metadata helpers (useful for UI rendering)
// ---------------------------------------------------------------------------

/** Static metadata describing an action type for tooltips, icons, etc. */
export interface ActionTypeMetadata {
  type: ActionType;
  label: string;
  description: string;
  basePcCost: number;
  targetScope: ActionTargetScope;
}
