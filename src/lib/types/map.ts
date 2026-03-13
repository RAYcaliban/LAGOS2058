/**
 * Map-related type definitions for LAGOS 2058.
 *
 * Used by the interactive GeoJSON / Mapbox-based election map components
 * for colouring modes and feature property typing.
 */

// ---------------------------------------------------------------------------
// Map colour mode — determines how LGA polygons are shaded
// ---------------------------------------------------------------------------

export type ColorMode = 'winner' | 'turnout' | 'margin';

// ---------------------------------------------------------------------------
// GeoJSON feature properties for each LGA polygon
// ---------------------------------------------------------------------------

/**
 * Properties attached to every GeoJSON Feature in the LGA map layer.
 * These come directly from the administrative boundary dataset and are
 * used for tooltip rendering, filtering, and data joins.
 */
export interface MapFeatureProperties {
  /** LGA name (ADM2-level administrative unit). */
  adm2_name: string;

  /** State name (ADM1-level administrative unit). */
  adm1_name: string;

  /** Electoral district this LGA belongs to. */
  district: string;

  /** Geopolitical / administrative zone. */
  zone: string;

  /** Estimated population of the LGA. */
  population: number;

  /** Number of registered voters in the LGA. */
  registeredVoters: number;
}

// ---------------------------------------------------------------------------
// Extended feature properties with election overlay data
// ---------------------------------------------------------------------------

/**
 * After election results are joined to the GeoJSON layer, each feature
 * gains these additional computed properties used for rendering.
 */
export interface MapElectionOverlay {
  /** Winning party code for this LGA. */
  winner: string;

  /** Hex colour of the winning party. */
  winnerColor: string;

  /** Voter turnout fraction (0.0 – 1.0). */
  turnout: number;

  /** Victory margin fraction (0.0 – 1.0). */
  margin: number;

  /** Full vote-share breakdown (party code -> fraction). */
  voteShares: Record<string, number>;
}

/** Combined properties when the election overlay is active. */
export type MapFeatureWithResults = MapFeatureProperties & MapElectionOverlay;
