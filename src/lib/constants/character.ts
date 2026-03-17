// Canonical ethnic groups from the engine (ethnic_affinity.py)
export const ETHNIC_GROUPS = [
  'Hausa',
  'Fulani',
  'Hausa-Fulani Undiff',
  'Yoruba',
  'Igbo',
  'Ijaw',
  'Kanuri',
  'Tiv',
  'Nupe',
  'Edo',
  'Ibibio',
  'Niger Delta Minorities',
  'Middle Belt Minorities',
  'Padà',
  'Naijin',
  'Other-North',
  'Other-South',
] as const

// Canonical religious groups from the engine (religious_affinity.py)
export const RELIGIOUS_GROUPS = [
  'Tijaniyya',
  'Qadiriyya',
  'Al-Shahid',
  'Mainstream Sunni',
  'Pentecostal',
  'Catholic',
  'Mainline Protestant',
  'Traditionalist',
  'Secular',
] as const

export type EthnicGroup = (typeof ETHNIC_GROUPS)[number]
export type ReligiousGroup = (typeof RELIGIOUS_GROUPS)[number]

// Dropdown option arrays
export const ETHNIC_GROUP_OPTIONS = ETHNIC_GROUPS.map((g) => ({
  value: g,
  label: g,
}))

// Roleplay aliases — display label differs from engine value
export const RELIGION_ALIASES: Record<string, string> = {
  'Shia': 'Mainstream Sunni',
  'Jewish': 'Secular',
}

export const RELIGIOUS_GROUP_OPTIONS = [
  ...RELIGIOUS_GROUPS.map((g) => ({
    value: g,
    label: g,
  })),
  { value: 'Shia', label: 'Shia' },
  { value: 'Jewish', label: 'Jewish' },
]

/** Given a display/dropdown value, return the engine-canonical value */
export function religionToEngine(display: string): string {
  return RELIGION_ALIASES[display] ?? display
}
