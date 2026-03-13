/**
 * LGA name normalisation and alias resolution for LAGOS 2058.
 *
 * LGA names appear in various forms across data sources — different
 * capitalisation, abbreviations, historical vs. modern spellings, and
 * hyphenation variants. This module provides a single canonical mapping
 * and helper functions for normalisation.
 */

// ---------------------------------------------------------------------------
// Normalisation helper
// ---------------------------------------------------------------------------

/**
 * Normalise an LGA name to a canonical lowercase form.
 *
 * Strips whitespace, lowercases, replaces hyphens with spaces, and
 * collapses multiple spaces.
 */
export function normalizeLga(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
}

// ---------------------------------------------------------------------------
// LGA alias table
//
// Keys are normalised variant spellings; values are the canonical LGA name
// used throughout the simulation. All keys should be lowercase with spaces
// (no hyphens).
// ---------------------------------------------------------------------------

export const LGA_ALIASES: Record<string, string> = {
  // Lagos LGAs — common variants and abbreviations
  'agege': 'Agege',
  'ajeromi ifelodun': 'Ajeromi-Ifelodun',
  'ajeromi': 'Ajeromi-Ifelodun',
  'ajeromiifelodun': 'Ajeromi-Ifelodun',
  'alimosho': 'Alimosho',
  'amuwo odofin': 'Amuwo-Odofin',
  'amuwo': 'Amuwo-Odofin',
  'amuwoordofin': 'Amuwo-Odofin',
  'apapa': 'Apapa',
  'badagry': 'Badagry',
  'epe': 'Epe',
  'eti osa': 'Eti-Osa',
  'eti osa east': 'Eti-Osa',
  'etiosa': 'Eti-Osa',
  'ibeju lekki': 'Ibeju-Lekki',
  'ibeju': 'Ibeju-Lekki',
  'ibejulekki': 'Ibeju-Lekki',
  'ifako ijaiye': 'Ifako-Ijaiye',
  'ifako ijaye': 'Ifako-Ijaiye',
  'ifako': 'Ifako-Ijaiye',
  'ifakoijaiye': 'Ifako-Ijaiye',
  'ikeja': 'Ikeja',
  'ikorodu': 'Ikorodu',
  'kosofe': 'Kosofe',
  'kosefe': 'Kosofe',
  'lagos island': 'Lagos Island',
  'lagosisland': 'Lagos Island',
  'lagos mainland': 'Lagos Mainland',
  'lagosmainland': 'Lagos Mainland',
  'mushin': 'Mushin',
  'ojo': 'Ojo',
  'oshodi isolo': 'Oshodi-Isolo',
  'oshodi': 'Oshodi-Isolo',
  'isolo': 'Oshodi-Isolo',
  'oshodiisolo': 'Oshodi-Isolo',
  'shomolu': 'Shomolu',
  'somolu': 'Shomolu',
  'surulere': 'Surulere',

  // FCT LGAs
  'abuja municipal': 'Abuja Municipal',
  'amac': 'Abuja Municipal',
  'abuja municipal area council': 'Abuja Municipal',
  'bwari': 'Bwari',
  'gwagwalada': 'Gwagwalada',
  'kuje': 'Kuje',
  'kwali': 'Kwali',
  'abaji': 'Abaji',
} as const;

// ---------------------------------------------------------------------------
// Resolution function
// ---------------------------------------------------------------------------

/**
 * Resolve a raw LGA name to its canonical form.
 *
 * First normalises the input, then checks the alias table. If no alias is
 * found the normalised form is title-cased and returned as-is, so unknown
 * LGAs degrade gracefully rather than throwing.
 */
export function resolveLga(raw: string): string {
  const normalised = normalizeLga(raw);

  if (normalised in LGA_ALIASES) {
    return LGA_ALIASES[normalised];
  }

  // Fallback: title-case each word
  return normalised
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
