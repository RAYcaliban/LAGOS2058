/**
 * Availability Zone (AZ) metadata for LAGOS 2058.
 *
 * The simulation divides Nigeria into 8 Availability Zones (AZ1-AZ8).
 * Hard-coded from zone_meta.json to match the game engine exactly.
 */

// ---------------------------------------------------------------------------
// AZ key union
// ---------------------------------------------------------------------------

export const AZ_KEYS = [
  'AZ1',
  'AZ2',
  'AZ3',
  'AZ4',
  'AZ5',
  'AZ6',
  'AZ7',
  'AZ8',
] as const;

export type AZKey = (typeof AZ_KEYS)[number];

// ---------------------------------------------------------------------------
// AZ descriptor
// ---------------------------------------------------------------------------

export interface AZDescriptor {
  /** Short key identifier (e.g. 'AZ1'). */
  key: AZKey;
  /** Full human-readable name. */
  name: string;
  /** States belonging to this AZ. */
  states: readonly string[];
  /** Number of LGAs in this zone. */
  lgaCount: number;
}

// ---------------------------------------------------------------------------
// AZ definitions (from zone_meta.json)
// ---------------------------------------------------------------------------

export const ZONES: readonly AZDescriptor[] = [
  {
    key: 'AZ1',
    name: 'Federal Capital Zone',
    states: ['Lagos'],
    lgaCount: 20,
  },
  {
    key: 'AZ2',
    name: 'Niger Zone',
    states: ['Kwara', 'Niger', 'Ogun', 'Oyo'],
    lgaCount: 94,
  },
  {
    key: 'AZ3',
    name: 'Confluence Zone',
    states: ['Edo', 'Ekiti', 'Kogi', 'Ondo', 'Osun'],
    lgaCount: 103,
  },
  {
    key: 'AZ4',
    name: 'Littoral Zone',
    states: ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Rivers'],
    lgaCount: 105,
  },
  {
    key: 'AZ5',
    name: 'Eastern Zone',
    states: ['Abia', 'Anambra', 'Benue', 'Ebonyi', 'Enugu', 'Imo'],
    lgaCount: 118,
  },
  {
    key: 'AZ6',
    name: 'Central Zone',
    states: ['FCT', 'Kano', 'Nasarawa', 'Plateau'],
    lgaCount: 80,
  },
  {
    key: 'AZ7',
    name: 'Chad Zone',
    states: ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Jigawa', 'Taraba', 'Yobe'],
    lgaCount: 139,
  },
  {
    key: 'AZ8',
    name: 'Savanna Zone',
    states: ['Kaduna', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
    lgaCount: 115,
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

/** Total LGA count across all zones. */
export const TOTAL_LGA_COUNT: number = ZONES.reduce(
  (sum, zone) => sum + zone.lgaCount,
  0,
);
