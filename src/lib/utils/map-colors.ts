/**
 * Colour interpolation utilities for the LAGOS 2058 election map.
 *
 * Provides colour-generation functions for the three main map modes:
 *   - Winner overlay (party colour)
 *   - Turnout heatmap (red -> green)
 *   - Margin heatmap (faint blue -> solid blue)
 *
 * All functions return CSS-compatible colour strings (hex or rgb).
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a hex colour string (#RGB or #RRGGBB) into [r, g, b] components. */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Convert [r, g, b] components to a hex colour string. */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) =>
    Math.round(Math.max(0, Math.min(255, c)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Clamp a number to [0, 1]. */
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Linearly interpolate between two values. */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// General-purpose colour interpolation
// ---------------------------------------------------------------------------

export interface ColorStop {
  value: number;
  color: string;
}

/**
 * Interpolate between an ordered array of colour stops.
 *
 * The `value` is mapped against the stop values; the returned colour is
 * linearly interpolated in RGB space between the two nearest stops.
 * Values outside the stop range are clamped to the nearest end colour.
 *
 * @param value       Numeric value to map.
 * @param colorStops  Sorted (ascending by `value`) array of colour stops.
 * @returns           CSS hex colour string.
 */
export function interpolateColor(
  value: number,
  colorStops: ColorStop[],
): string {
  if (colorStops.length === 0) return '#888888';
  if (colorStops.length === 1) return colorStops[0].color;

  // Clamp to range
  if (value <= colorStops[0].value) return colorStops[0].color;
  if (value >= colorStops[colorStops.length - 1].value) {
    return colorStops[colorStops.length - 1].color;
  }

  // Find the two surrounding stops
  let lo = 0;
  for (let i = 1; i < colorStops.length; i++) {
    if (colorStops[i].value >= value) {
      lo = i - 1;
      break;
    }
  }
  const hi = lo + 1;

  const range = colorStops[hi].value - colorStops[lo].value;
  const t = range === 0 ? 0 : (value - colorStops[lo].value) / range;

  const [r1, g1, b1] = hexToRgb(colorStops[lo].color);
  const [r2, g2, b2] = hexToRgb(colorStops[hi].color);

  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

// ---------------------------------------------------------------------------
// Map-mode colour functions
// ---------------------------------------------------------------------------

/**
 * Return the fill colour for a "winner" map overlay.
 *
 * Currently passes through the party colour unchanged, but provides a
 * single call-site for future adjustments (opacity, desaturation, etc.).
 *
 * @param partyColor  Hex colour assigned to the winning party.
 */
export function getWinnerColor(partyColor: string): string {
  return partyColor;
}

/**
 * Map a voter-turnout percentage (0-1) to a colour ranging from red
 * (low turnout) through yellow to green (high turnout).
 *
 * @param turnout  Turnout fraction, 0.0 to 1.0.
 */
export function getTurnoutColor(turnout: number): string {
  const t = clamp01(turnout);
  return interpolateColor(t, [
    { value: 0.0, color: '#d73027' }, // red  — low turnout
    { value: 0.3, color: '#fc8d59' }, // orange
    { value: 0.5, color: '#fee08b' }, // yellow — mid turnout
    { value: 0.7, color: '#91cf60' }, // light green
    { value: 1.0, color: '#1a9850' }, // green — high turnout
  ]);
}

/**
 * Map an electoral margin (0-1) to a colour ranging from faint blue
 * (close / competitive) to solid blue (safe seat).
 *
 * @param margin  Victory margin as a fraction, 0.0 (dead heat) to 1.0 (landslide).
 */
export function getMarginColor(margin: number): string {
  const m = clamp01(margin);
  return interpolateColor(m, [
    { value: 0.0, color: '#deebf7' }, // faint blue — close race
    { value: 0.25, color: '#9ecae1' }, // light blue
    { value: 0.5, color: '#4292c6' }, // medium blue
    { value: 0.75, color: '#2171b5' }, // strong blue
    { value: 1.0, color: '#08306b' }, // solid blue — safe seat
  ]);
}
