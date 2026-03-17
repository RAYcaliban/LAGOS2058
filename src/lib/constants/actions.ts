/**
 * Action metadata and Political Capital (PC) costs for LAGOS 2058.
 *
 * Ported from the Python simulation reference. Every player action in the
 * campaign simulation consumes PC and targets a geographic scope.
 */

// ---------------------------------------------------------------------------
// Action type union
// ---------------------------------------------------------------------------

export const ACTION_TYPES = [
  'rally',
  'advertising',
  'manifesto',
  'ground_game',
  'endorsement',
  'ethnic_mobilization',
  'patronage',
  'opposition_research',
  'media',
  'epo_engagement',
  'crisis_response',
  'fundraising',
  'poll',
  'epo_intelligence',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Target scope — determines what geographic level the action targets
// ---------------------------------------------------------------------------

export type TargetScope = 'district' | 'lga' | 'regional' | 'none';

// ---------------------------------------------------------------------------
// Endorser type union
// ---------------------------------------------------------------------------

export const ENDORSER_TYPES = [
  'traditional_ruler',
  'religious_leader',
  'epo_leader',
  'celebrity',
  'notable',
] as const;

export type EndorserType = (typeof ENDORSER_TYPES)[number];

// ---------------------------------------------------------------------------
// PC costs — the Political Capital price for each action
// ---------------------------------------------------------------------------

export const PC_COSTS: Record<ActionType, number> = {
  rally: 2,
  advertising: 2,
  manifesto: 3,
  ground_game: 3,
  endorsement: 2,
  ethnic_mobilization: 2,
  patronage: 3,
  opposition_research: 2,
  media: 1,
  epo_engagement: 3,
  crisis_response: 2,
  fundraising: 2,
  poll: 1,
  epo_intelligence: 0,
} as const;

// ---------------------------------------------------------------------------
// Action target scope — geographic level each action operates on
// ---------------------------------------------------------------------------

export const ACTION_TARGET_SCOPE: Record<ActionType, TargetScope> = {
  rally: 'district',
  advertising: 'regional',
  manifesto: 'none',
  ground_game: 'district',
  endorsement: 'regional',
  ethnic_mobilization: 'regional',
  patronage: 'lga',
  opposition_research: 'none',
  media: 'none',
  epo_engagement: 'lga',
  crisis_response: 'lga',
  fundraising: 'none',
  poll: 'none',
  epo_intelligence: 'none',
} as const;

// ---------------------------------------------------------------------------
// Endorser target scope — geographic reach per endorser type
// ---------------------------------------------------------------------------

export const ENDORSER_TARGET_SCOPE: Record<EndorserType, TargetScope> = {
  traditional_ruler: 'lga',
  religious_leader: 'regional',
  epo_leader: 'regional',
  celebrity: 'none',
  notable: 'district',
} as const;

// ---------------------------------------------------------------------------
// Human-readable labels
// ---------------------------------------------------------------------------

export const ACTION_LABELS: Record<ActionType, string> = {
  rally: 'Rally',
  advertising: 'Advertising',
  manifesto: 'Manifesto',
  ground_game: 'Ground Game',
  endorsement: 'Endorsement',
  ethnic_mobilization: 'Ethnic Mobilization',
  patronage: 'Patronage',
  opposition_research: 'Opposition Research',
  media: 'Media Appearance',
  epo_engagement: 'EPO Engagement',
  crisis_response: 'Crisis Response',
  fundraising: 'Fundraising',
  poll: 'Poll',
  epo_intelligence: 'EPO Intelligence',
} as const;

// ---------------------------------------------------------------------------
// Brief descriptions
// ---------------------------------------------------------------------------

export const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  rally:
    'Hold a public rally in a district to boost voter awareness and support.',
  advertising:
    'Run advertising campaigns across a region via billboards, radio, or digital media.',
  manifesto:
    'Publish or update the party manifesto, shaping national issue positions.',
  ground_game:
    'Deploy canvassers and volunteers for door-to-door outreach in a district.',
  endorsement:
    'Seek an endorsement from a prominent figure to boost credibility in a region.',
  ethnic_mobilization:
    'Mobilize support along ethnic or communal lines within a region.',
  patronage:
    'Distribute patronage resources to local power-brokers in an LGA.',
  opposition_research:
    'Investigate rival parties for scandals or policy weaknesses.',
  media:
    'Make a media appearance to shape the national narrative at minimal cost.',
  epo_engagement:
    'Engage with an Extra-Parliamentary Organisation in a specific LGA.',
  crisis_response:
    'Respond to an emerging crisis in an LGA to mitigate political damage.',
  fundraising:
    'Organise fundraising activities to replenish Political Capital.',
  poll:
    'Commission a poll to gain intelligence on current voter sentiment.',
  epo_intelligence:
    'Gather intelligence on EPO activities and influence at no PC cost.',
} as const;

// ---------------------------------------------------------------------------
// Economy constants
// ---------------------------------------------------------------------------

/** Base Political Capital income (1-member party) at the start of every turn. */
export const PC_INCOME_BASE = 7;

/** Bonus PC per additional party member beyond the first. */
export const PC_INCOME_PER_EXTRA_MEMBER = 2;

/** Maximum PC income a party can earn per turn regardless of size. */
export const PC_INCOME_CAP = 21;

/** Maximum PC a party may accumulate (hoarding cap). */
export const PC_HOARDING_CAP = 68;

/** Calculate PC income for a party based on member count. */
export function calcPartyIncome(memberCount: number): number {
  const raw = PC_INCOME_BASE + Math.max(0, memberCount - 1) * PC_INCOME_PER_EXTRA_MEMBER;
  return Math.min(raw, PC_INCOME_CAP);
}
