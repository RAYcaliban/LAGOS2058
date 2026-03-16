/**
 * Issue dimensions for the LAGOS 2058 policy space.
 *
 * The simulation models voter preferences and party positions across 28
 * orthogonal issue dimensions (indices 0-27). Each dimension represents a
 * policy axis on which parties stake out positions and voters hold opinions.
 *
 * Ported from the Python engine's config.py ISSUE_NAMES.
 */

// ---------------------------------------------------------------------------
// Issue key union — matches engine config.py ISSUE_NAMES exactly
// ---------------------------------------------------------------------------

export const ISSUE_KEYS = [
  'sharia_jurisdiction',       // 0
  'fiscal_autonomy',           // 1
  'chinese_relations',         // 2
  'bic_reform',                // 3
  'ethnic_quotas',             // 4
  'fertility_policy',          // 5
  'constitutional_structure',  // 6
  'resource_revenue',          // 7
  'housing',                   // 8
  'education',                 // 9
  'labor_automation',          // 10
  'military_role',             // 11
  'immigration',               // 12
  'language_policy',           // 13
  'womens_rights',             // 14
  'traditional_authority',     // 15
  'infrastructure',            // 16
  'land_tenure',               // 17
  'taxation',                  // 18
  'agricultural_policy',       // 19
  'biological_enhancement',    // 20
  'trade_policy',              // 21
  'environmental_regulation',  // 22
  'media_freedom',             // 23
  'healthcare',                // 24
  'pada_status',               // 25
  'energy_policy',             // 26
  'az_restructuring',          // 27
] as const;

export type IssueKey = (typeof ISSUE_KEYS)[number];

// ---------------------------------------------------------------------------
// Issue descriptor
// ---------------------------------------------------------------------------

export interface IssueDescriptor {
  /** Numeric index in the 28-dimensional position vector. */
  index: number;
  /** Machine-readable key. */
  key: IssueKey;
  /** Human-readable label. */
  label: string;
  /** Short description of the policy axis (low ↔ high). */
  description: string;
}

// ---------------------------------------------------------------------------
// Full issue catalogue (indices 0-27, matching engine config.py)
// ---------------------------------------------------------------------------

export const ISSUES: readonly IssueDescriptor[] = [
  {
    index: 0,
    key: 'sharia_jurisdiction',
    label: 'Sharia Jurisdiction',
    description: 'Secular ↔ full Sharia.',
  },
  {
    index: 1,
    key: 'fiscal_autonomy',
    label: 'Fiscal Autonomy',
    description: 'Centralism ↔ confederalism.',
  },
  {
    index: 2,
    key: 'chinese_relations',
    label: 'Chinese Relations',
    description: 'Western pivot ↔ deepen WAFTA.',
  },
  {
    index: 3,
    key: 'bic_reform',
    label: 'BIC Reform',
    description: 'Abolish ↔ preserve BIC.',
  },
  {
    index: 4,
    key: 'ethnic_quotas',
    label: 'Ethnic Quotas',
    description: 'Meritocracy ↔ affirmative action.',
  },
  {
    index: 5,
    key: 'fertility_policy',
    label: 'Fertility Policy',
    description: 'Population control ↔ pro-natalism.',
  },
  {
    index: 6,
    key: 'constitutional_structure',
    label: 'Constitutional Structure',
    description: 'Parliamentary ↔ presidential.',
  },
  {
    index: 7,
    key: 'resource_revenue',
    label: 'Resource Revenue',
    description: 'Federal monopoly ↔ local control.',
  },
  {
    index: 8,
    key: 'housing',
    label: 'Housing',
    description: 'Pure market ↔ state intervention.',
  },
  {
    index: 9,
    key: 'education',
    label: 'Education',
    description: 'Radical localism ↔ meritocratic centralism.',
  },
  {
    index: 10,
    key: 'labor_automation',
    label: 'Labour & Automation',
    description: 'Pro-capital ↔ pro-labor.',
  },
  {
    index: 11,
    key: 'military_role',
    label: 'Military Role',
    description: 'Civilian control ↔ military guardianship.',
  },
  {
    index: 12,
    key: 'immigration',
    label: 'Immigration',
    description: 'Open borders ↔ restrictionism.',
  },
  {
    index: 13,
    key: 'language_policy',
    label: 'Language Policy',
    description: 'Vernacular ↔ English supremacy.',
  },
  {
    index: 14,
    key: 'womens_rights',
    label: "Women's Rights",
    description: 'Traditional patriarchy ↔ aggressive feminism.',
  },
  {
    index: 15,
    key: 'traditional_authority',
    label: 'Traditional Authority',
    description: 'Marginalisation ↔ formal integration.',
  },
  {
    index: 16,
    key: 'infrastructure',
    label: 'Infrastructure',
    description: 'Targeted ↔ universal provision.',
  },
  {
    index: 17,
    key: 'land_tenure',
    label: 'Land Tenure',
    description: 'Customary ↔ formalisation.',
  },
  {
    index: 18,
    key: 'taxation',
    label: 'Taxation',
    description: 'Low tax ↔ high redistribution.',
  },
  {
    index: 19,
    key: 'agricultural_policy',
    label: 'Agricultural Policy',
    description: 'Free market ↔ protectionist smallholder.',
  },
  {
    index: 20,
    key: 'biological_enhancement',
    label: 'Biological Enhancement',
    description: 'Prohibition ↔ universal access.',
  },
  {
    index: 21,
    key: 'trade_policy',
    label: 'Trade Policy',
    description: 'Autarky ↔ full openness.',
  },
  {
    index: 22,
    key: 'environmental_regulation',
    label: 'Environmental Regulation',
    description: 'Growth first ↔ strong regulation.',
  },
  {
    index: 23,
    key: 'media_freedom',
    label: 'Media Freedom',
    description: 'State control ↔ full press freedom.',
  },
  {
    index: 24,
    key: 'healthcare',
    label: 'Healthcare',
    description: 'Pure market ↔ universal provision.',
  },
  {
    index: 25,
    key: 'pada_status',
    label: 'PADA Status',
    description: 'Anti-Pada ↔ Pada preservation.',
  },
  {
    index: 26,
    key: 'energy_policy',
    label: 'Energy Policy',
    description: 'Fossil status quo ↔ green transition.',
  },
  {
    index: 27,
    key: 'az_restructuring',
    label: 'AZ Restructuring',
    description: 'Return to 36+ states ↔ keep 8 AZs.',
  },
] as const;

// ---------------------------------------------------------------------------
// Convenience lookups
// ---------------------------------------------------------------------------

/** Map from issue key to its descriptor. */
export const ISSUE_BY_KEY: Record<IssueKey, IssueDescriptor> = Object.fromEntries(
  ISSUES.map((issue) => [issue.key, issue]),
) as Record<IssueKey, IssueDescriptor>;

/** Map from numeric index to its descriptor. */
export const ISSUE_BY_INDEX: Record<number, IssueDescriptor> = Object.fromEntries(
  ISSUES.map((issue) => [issue.index, issue]),
) as Record<number, IssueDescriptor>;

// ---------------------------------------------------------------------------
// Rhetorical styles (formerly "Campaign Languages" — these are rhetorical
// framings, not natural languages)
// ---------------------------------------------------------------------------

export const RHETORICAL_STYLES = [
  'populist',
  'technocratic',
  'traditionalist',
  'progressive',
  'nationalist',
  'islamist',
  'pan_africanist',
  'pragmatist',
] as const;

export type RhetoricalStyle = (typeof RHETORICAL_STYLES)[number];

/**
 * Each rhetorical style emphasises a subset of the 28 issue dimensions.
 * Values are the *indices* of the dimensions that style puts particular
 * weight on during campaign messaging and voter persuasion.
 */
export const RHETORICAL_STYLE_PROFILES: Record<RhetoricalStyle, readonly number[]> = {
  populist: [3, 7, 8, 18, 19],
  // bic_reform, resource_revenue, housing, taxation, agricultural_policy

  technocratic: [2, 9, 10, 16, 20, 22, 24],
  // chinese_relations, education, labor_automation, infrastructure,
  // biological_enhancement, environmental_regulation, healthcare

  traditionalist: [0, 5, 6, 15, 17],
  // sharia_jurisdiction, fertility_policy, constitutional_structure,
  // traditional_authority, land_tenure

  progressive: [6, 14, 20, 22, 23],
  // constitutional_structure, womens_rights, biological_enhancement,
  // environmental_regulation, media_freedom

  nationalist: [1, 2, 6, 11, 12, 21],
  // fiscal_autonomy, chinese_relations, constitutional_structure,
  // military_role, immigration, trade_policy

  islamist: [0, 5, 6, 14, 15],
  // sharia_jurisdiction, fertility_policy, constitutional_structure,
  // womens_rights, traditional_authority

  pan_africanist: [2, 12, 21, 25, 27],
  // chinese_relations, immigration, trade_policy,
  // pada_status, az_restructuring

  pragmatist: [1, 7, 16, 18, 19, 20],
  // fiscal_autonomy, resource_revenue, infrastructure,
  // taxation, agricultural_policy, biological_enhancement
} as const;

// ---------------------------------------------------------------------------
// Campaign languages (actual natural languages used for messaging)
// ---------------------------------------------------------------------------

export const CAMPAIGN_LANGUAGES = [
  'english',
  'hausa',
  'yoruba',
  'igbo',
  'arabic',
  'pidgin',
  'mandarin',
] as const;

export type CampaignLanguage = (typeof CAMPAIGN_LANGUAGES)[number];

/**
 * Language → issue dimension emphasis weights.
 * Ported verbatim from engine campaign_actions.py LANGUAGE_ISSUE_PROFILES.
 * Keys are issue dimension indices (0-27), values are emphasis weights.
 */
export const LANGUAGE_ISSUE_EMPHASIS: Record<CampaignLanguage, Record<number, number>> = {
  english: {
    3: 0.15,   // bic_reform
    4: 0.15,   // ethnic_quotas
    7: 0.12,   // resource_revenue
    11: 0.10,  // military_role
    14: 0.08,  // womens_rights
    19: 0.08,  // agricultural_policy
    21: 0.08,  // trade_policy
    22: 0.08,  // environmental_regulation
    24: 0.08,  // healthcare
    26: 0.08,  // energy_policy
  },
  hausa: {
    0: 0.25,   // sharia_jurisdiction
    5: 0.15,   // fertility_policy
    10: 0.12,  // labor_automation
    15: 0.12,  // traditional_authority
    14: 0.10,  // womens_rights
    13: 0.08,  // language_policy
    27: 0.08,  // az_restructuring
    17: 0.05,  // land_tenure
    8: 0.05,   // housing
  },
  yoruba: {
    1: 0.20,   // fiscal_autonomy
    8: 0.15,   // housing
    27: 0.12,  // az_restructuring
    10: 0.10,  // labor_automation
    26: 0.10,  // energy_policy
    17: 0.08,  // land_tenure
    19: 0.08,  // agricultural_policy
    16: 0.05,  // infrastructure
    9: 0.05,   // education
    15: 0.07,  // traditional_authority
  },
  igbo: {
    1: 0.20,   // fiscal_autonomy
    27: 0.15,  // az_restructuring
    8: 0.12,   // housing
    22: 0.10,  // environmental_regulation
    19: 0.10,  // agricultural_policy
    4: 0.08,   // ethnic_quotas
    16: 0.08,  // infrastructure
    10: 0.07,  // labor_automation
    11: 0.05,  // military_role
    5: 0.05,   // fertility_policy
  },
  arabic: {
    0: 0.35,   // sharia_jurisdiction
    10: 0.15,  // labor_automation
    15: 0.12,  // traditional_authority
    14: 0.10,  // womens_rights
    5: 0.08,   // fertility_policy
    13: 0.05,  // language_policy
    16: 0.05,  // infrastructure
    12: 0.05,  // immigration
    17: 0.05,  // land_tenure
  },
  pidgin: {
    9: 0.15,   // education
    19: 0.12,  // agricultural_policy
    11: 0.12,  // military_role
    25: 0.10,  // pada_status
    16: 0.10,  // infrastructure
    26: 0.10,  // energy_policy
    4: 0.08,   // ethnic_quotas
    20: 0.08,  // biological_enhancement
    13: 0.08,  // language_policy
    17: 0.07,  // land_tenure
  },
  mandarin: {
    3: 0.25,   // bic_reform
    22: 0.15,  // environmental_regulation
    11: 0.12,  // military_role
    21: 0.10,  // trade_policy
    16: 0.10,  // infrastructure
    10: 0.08,  // labor_automation
    27: 0.05,  // az_restructuring
    23: 0.05,  // media_freedom
    14: 0.05,  // womens_rights
    9: 0.05,   // education
  },
};
