/**
 * Issue dimensions for the LAGOS 2058 policy space.
 *
 * The simulation models voter preferences and party positions across 28
 * orthogonal issue dimensions (indices 0-27). Each dimension represents a
 * policy axis on which parties stake out positions and voters hold opinions.
 *
 * Ported from the Python simulation reference.
 */

// ---------------------------------------------------------------------------
// Issue key union
// ---------------------------------------------------------------------------

export const ISSUE_KEYS = [
  'sharia_jurisdiction',
  'fiscal_autonomy',
  'security_reform',
  'chinese_relations',
  'bic_reform',
  'fertility_policy',
  'drug_policy',
  'constitutional_structure',
  'resource_revenue',
  'housing',
  'education',
  'labor_automation',
  'military_role',
  'immigration',
  'womens_rights',
  'traditional_authority',
  'infrastructure',
  'land_tenure',
  'corruption',
  'taxation',
  'agricultural_policy',
  'biological_enhancement',
  'trade_policy',
  'environmental_regulation',
  'media_freedom',
  'healthcare',
  'pada_status',
  'energy_policy',
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
  /** Short description of the policy axis. */
  description: string;
}

// ---------------------------------------------------------------------------
// Full issue catalogue (indices 0-27)
// ---------------------------------------------------------------------------

export const ISSUES: readonly IssueDescriptor[] = [
  {
    index: 0,
    key: 'sharia_jurisdiction',
    label: 'Sharia Jurisdiction',
    description:
      'Scope and application of Sharia law in northern states and federal institutions.',
  },
  {
    index: 1,
    key: 'fiscal_autonomy',
    label: 'Fiscal Autonomy',
    description:
      'Degree of fiscal independence for states and LGAs versus federal redistribution.',
  },
  {
    index: 2,
    key: 'security_reform',
    label: 'Security Reform',
    description:
      'Restructuring of federal and state security apparatus, including police decentralisation.',
  },
  {
    index: 3,
    key: 'chinese_relations',
    label: 'Chinese Relations',
    description:
      'Diplomatic and economic orientation toward the People\'s Republic of China and Belt-Road successors.',
  },
  {
    index: 4,
    key: 'bic_reform',
    label: 'BIC Reform',
    description:
      'Reform of the Basic Income Credit system — universality, amount, and conditionality.',
  },
  {
    index: 5,
    key: 'fertility_policy',
    label: 'Fertility Policy / Ethnic Quotas',
    description:
      'Government stance on fertility incentives, family planning, and ethnic quota systems.',
  },
  {
    index: 6,
    key: 'drug_policy',
    label: 'Drug Policy',
    description:
      'Legalisation, decriminalisation, or criminalisation of controlled substances.',
  },
  {
    index: 7,
    key: 'constitutional_structure',
    label: 'Constitutional Structure',
    description:
      'Federal vs. confederal vs. unitary constitutional arrangements.',
  },
  {
    index: 8,
    key: 'resource_revenue',
    label: 'Resource Revenue',
    description:
      'Distribution and management of oil, gas, and mineral resource revenues.',
  },
  {
    index: 9,
    key: 'housing',
    label: 'Housing',
    description:
      'Affordable housing policy, urban planning, and slum upgrading programmes.',
  },
  {
    index: 10,
    key: 'education',
    label: 'Education',
    description:
      'Education system reform, curriculum modernisation, and funding allocation.',
  },
  {
    index: 11,
    key: 'labor_automation',
    label: 'Labour & Automation',
    description:
      'Labour market regulation, automation displacement, and retraining programmes.',
  },
  {
    index: 12,
    key: 'military_role',
    label: 'Military Role',
    description:
      'Role of the military in domestic security, politics, and economic enterprises.',
  },
  {
    index: 13,
    key: 'immigration',
    label: 'Immigration',
    description:
      'Immigration policy, border control, and treatment of ECOWAS free-movement provisions.',
  },
  {
    index: 14,
    key: 'womens_rights',
    label: "Women's Rights / Language Policy",
    description:
      "Women's rights, gender equality legislation, and official language policy.",
  },
  {
    index: 15,
    key: 'traditional_authority',
    label: 'Traditional Authority',
    description:
      'Status and powers of traditional rulers, emirs, and obas in modern governance.',
  },
  {
    index: 16,
    key: 'infrastructure',
    label: 'Infrastructure',
    description:
      'Major infrastructure investment priorities — transport, power, telecoms.',
  },
  {
    index: 17,
    key: 'land_tenure',
    label: 'Land Tenure',
    description:
      'Land use reform, Land Use Act revision, and property rights modernisation.',
  },
  {
    index: 18,
    key: 'corruption',
    label: 'Corruption',
    description:
      'Anti-corruption enforcement, transparency mechanisms, and institutional reform.',
  },
  {
    index: 19,
    key: 'taxation',
    label: 'Taxation',
    description:
      'Tax policy reform, VAT distribution, and progressive vs. flat tax debates.',
  },
  {
    index: 20,
    key: 'agricultural_policy',
    label: 'Agricultural Policy',
    description:
      'Agricultural modernisation, subsidy programmes, and food security strategy.',
  },
  {
    index: 21,
    key: 'biological_enhancement',
    label: 'Biological Enhancement',
    description:
      'Regulation of genetic modification, bioaugmentation, and human enhancement technologies.',
  },
  {
    index: 22,
    key: 'trade_policy',
    label: 'Trade Policy',
    description:
      'Trade liberalisation vs. protectionism, AfCFTA compliance, and tariff regimes.',
  },
  {
    index: 23,
    key: 'environmental_regulation',
    label: 'Environmental Regulation',
    description:
      'Environmental protections, climate adaptation, and pollution control.',
  },
  {
    index: 24,
    key: 'media_freedom',
    label: 'Media Freedom',
    description:
      'Press freedom, digital rights, surveillance regulation, and censorship.',
  },
  {
    index: 25,
    key: 'healthcare',
    label: 'Healthcare',
    description:
      'Healthcare system reform, universal coverage, and pharmaceutical regulation.',
  },
  {
    index: 26,
    key: 'pada_status',
    label: 'PADA Status',
    description:
      'Status and reform of the Pan-African Development Authority and its programmes.',
  },
  {
    index: 27,
    key: 'energy_policy',
    label: 'Energy Policy / AZ Restructuring',
    description:
      'Energy transition strategy and Availability Zone administrative restructuring.',
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
// Campaign language type
// ---------------------------------------------------------------------------

export const CAMPAIGN_LANGUAGES = [
  'populist',
  'technocratic',
  'traditionalist',
  'progressive',
  'nationalist',
  'islamist',
  'pan_africanist',
  'pragmatist',
] as const;

export type CampaignLanguage = (typeof CAMPAIGN_LANGUAGES)[number];

// ---------------------------------------------------------------------------
// Language issue profiles
//
// Each campaign language emphasises a subset of the 28 issue dimensions.
// The arrays contain the *indices* of the dimensions that language puts
// particular weight on during campaign messaging and voter persuasion.
// ---------------------------------------------------------------------------

export const LANGUAGE_ISSUE_PROFILES: Record<CampaignLanguage, readonly number[]> = {
  populist: [4, 8, 9, 18, 19],
  // BIC reform, resource revenue, housing, corruption, taxation

  technocratic: [2, 10, 11, 16, 21, 23, 25],
  // security reform, education, labor/automation, infrastructure,
  // biological enhancement, environmental regulation, healthcare

  traditionalist: [0, 5, 7, 15, 17],
  // sharia jurisdiction, fertility policy, constitutional structure,
  // traditional authority, land tenure

  progressive: [6, 14, 21, 23, 24],
  // drug policy, women's rights, biological enhancement,
  // environmental regulation, media freedom

  nationalist: [1, 3, 7, 12, 13, 22],
  // fiscal autonomy, chinese relations, constitutional structure,
  // military role, immigration, trade policy

  islamist: [0, 5, 6, 14, 15],
  // sharia jurisdiction, fertility policy, drug policy,
  // women's rights / language policy, traditional authority

  pan_africanist: [3, 13, 22, 26, 27],
  // chinese relations, immigration, trade policy,
  // PADA status, energy policy / AZ restructuring

  pragmatist: [1, 8, 16, 18, 19, 20],
  // fiscal autonomy, resource revenue, infrastructure,
  // corruption, taxation, agricultural policy
} as const;
