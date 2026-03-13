/**
 * LGA name normalisation utilities for LAGOS 2058.
 *
 * Provides normalisation and resolution functions for LGA names that
 * appear in GeoJSON data, user input, and database records.  Delegates
 * alias lookup to the canonical table in `@/lib/constants/lga-aliases`.
 */

import {
  LGA_ALIASES,
  normalizeLga as baseNormalize,
} from '@/lib/constants/lga-aliases';

// ---------------------------------------------------------------------------
// Core normaliser
// ---------------------------------------------------------------------------

/**
 * Normalise an LGA name to a canonical lowercase form.
 *
 * Steps:
 *  1. Lowercase and trim.
 *  2. Strip parenthetical suffixes — e.g. "Ikeja (Lagos)" -> "ikeja".
 *  3. Collapse hyphens, slashes, and multiple spaces to a single space.
 *
 * This extends the base normaliser from the constants module by also
 * stripping parenthetical content and handling slashes, which commonly
 * appear in GeoJSON feature properties.
 *
 * @param name  Raw LGA name from any source.
 * @returns     Normalised string suitable for lookup / comparison.
 */
export function normalizeLga(name: string): string {
  let s = name.toLowerCase().trim();

  // Strip parenthetical content: "Ikeja (Lagos)" -> "ikeja"
  s = s.replace(/\s*\(.*?\)\s*/g, '');

  // Replace slashes with spaces before delegating
  s = s.replace(/[/\\]/g, ' ');

  // Delegate the rest to the base normaliser (hyphen -> space, collapse whitespace)
  return baseNormalize(s);
}

// ---------------------------------------------------------------------------
// Resolver (normalise + alias lookup)
// ---------------------------------------------------------------------------

/**
 * Resolve a geographic / display LGA name to its canonical identifier.
 *
 * First normalises the input using the extended normaliser (which handles
 * parentheticals and slashes), then checks the alias table.  If no alias
 * exists, a title-cased fallback is returned so unknown names degrade
 * gracefully rather than throwing.
 *
 * @param geoName  LGA name as it appears in GeoJSON, UI, or user input.
 * @returns        Canonical LGA identifier.
 */
export function resolveLga(geoName: string): string {
  const normalised = normalizeLga(geoName);

  if (normalised in LGA_ALIASES) {
    return LGA_ALIASES[normalised];
  }

  // Fallback: title-case each word
  return normalised
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
