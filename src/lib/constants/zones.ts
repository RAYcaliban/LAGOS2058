/**
 * Availability Zone (AZ) metadata for LAGOS 2058.
 *
 * The simulation divides Nigeria into 8 Availability Zones. Six correspond
 * to the real-world geopolitical zones, one covers the Federal Capital
 * Territory, and one covers Lagos (which in 2058 has been elevated to its
 * own AZ due to its population and economic significance).
 */

// ---------------------------------------------------------------------------
// AZ key union
// ---------------------------------------------------------------------------

export const AZ_KEYS = [
  'NW',
  'NE',
  'NC',
  'SW',
  'SE',
  'SS',
  'FCT',
  'Lagos',
] as const;

export type AZKey = (typeof AZ_KEYS)[number];

// ---------------------------------------------------------------------------
// AZ descriptor
// ---------------------------------------------------------------------------

export interface AZDescriptor {
  /** Short key identifier (e.g. 'NW'). */
  key: AZKey;
  /** Full human-readable name. */
  name: string;
  /** States belonging to this AZ. */
  states: readonly string[];
  /** Approximate number of LGAs in this zone. */
  lgaCount: number;
}

// ---------------------------------------------------------------------------
// AZ definitions
// ---------------------------------------------------------------------------

export const ZONES: readonly AZDescriptor[] = [
  {
    key: 'NW',
    name: 'North West',
    states: ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
    lgaCount: 186,
  },
  {
    key: 'NE',
    name: 'North East',
    states: ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
    lgaCount: 112,
  },
  {
    key: 'NC',
    name: 'North Central',
    states: ['Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau'],
    lgaCount: 121,
  },
  {
    key: 'SW',
    name: 'South West',
    states: ['Ekiti', 'Ogun', 'Ondo', 'Osun', 'Oyo'],
    lgaCount: 99,
  },
  {
    key: 'SE',
    name: 'South East',
    states: ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
    lgaCount: 95,
  },
  {
    key: 'SS',
    name: 'South South',
    states: ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
    lgaCount: 123,
  },
  {
    key: 'FCT',
    name: 'Federal Capital Territory',
    states: ['FCT'],
    lgaCount: 6,
  },
  {
    key: 'Lagos',
    name: 'Lagos',
    states: ['Lagos'],
    lgaCount: 20,
  },
] as const;

// ---------------------------------------------------------------------------
// Convenience lookups
// ---------------------------------------------------------------------------

/** Map from AZ key to its descriptor. */
export const ZONE_BY_KEY: Record<AZKey, AZDescriptor> = Object.fromEntries(
  ZONES.map((zone) => [zone.key, zone]),
) as Record<AZKey, AZDescriptor>;

/** All state names across all AZs, in a flat array. */
export const ALL_STATES: readonly string[] = ZONES.flatMap((zone) => zone.states);

/** Total approximate LGA count across all zones. */
export const TOTAL_LGA_COUNT: number = ZONES.reduce(
  (sum, zone) => sum + zone.lgaCount,
  0,
);
