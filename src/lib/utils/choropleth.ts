/**
 * Choropleth color functions ported from nigeria_2058_map.html.
 * Maps LGA demographic properties to fill colors for each visualization mode.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hexLerp(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function seqScale(value: number, min: number, max: number, colors: string[]): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  const idx = t * (colors.length - 1)
  const lo = Math.floor(idx), hi = Math.min(lo + 1, colors.length - 1)
  return hexLerp(colors[lo], colors[hi], idx - lo)
}

// ---------------------------------------------------------------------------
// Zone colors
// ---------------------------------------------------------------------------

export const ZONE_COLORS: Record<number, string> = {
  1: '#D4870A', // Federal Capital — Amber Gold
  2: '#B45A14', // Niger — Burnt Terracotta
  3: '#4A6FA5', // Confluence — Chrome Blue
  4: '#C83838', // Littoral — Coral Vermilion
  5: '#2A8B9A', // Eastern — Teal Cyan
  6: '#6A8A5A', // Central — Sage Green
  7: '#7B4EC8', // Chad — Deep Indigo
  8: '#D06A10', // Savanna — Warm Copper
}

export const ZONE_GLOW: Record<number, string> = {
  1: '#F0A820', 2: '#D07828', 3: '#6A90C0', 4: '#E05050',
  5: '#38B0C4', 6: '#88AA78', 7: '#9A70E0', 8: '#E88830',
}

// ---------------------------------------------------------------------------
// LGA feature properties (from the enriched GeoJSON)
// ---------------------------------------------------------------------------

export interface LGAProperties {
  n: string    // LGA name
  s: string    // State
  d: string    // District ID (e.g. "AZ5-D08")
  z: number    // Zone number (1-8)
  zn: string   // Zone name
  rm: number   // % Muslim
  rc: number   // % Christian
  rt: number   // % Traditionalist
  eg: string   // Dominant ethnic group
  ep: number   // Dominant ethnic group %
  ed: number   // Ethnic diversity index (ELF)
  pv: number   // Poverty rate %
  al: number   // Adult literacy %
  pe: number   // Primary enrollment %
  se: number   // Secondary enrollment %
  gp: number   // Gender parity index
  pop: number  // Population
}

// ---------------------------------------------------------------------------
// Choropleth modes
// ---------------------------------------------------------------------------

export type ChoroMode = 'zones' | 'religion' | 'ethnicity' | 'poverty' | 'education' | 'population' | 'bivariate'
export type EthSubMode = 'diversity' | 'dominant'

// Religion
const REL_SCALES: Record<string, string[]> = {
  muslim: ['#B7E4C7', '#52B788', '#2D6A4F', '#1B4332'],
  christian: ['#A8DADC', '#457B9D', '#1D3557', '#0D1B2A'],
  traditionalist: ['#DDB892', '#B08968', '#7F4F24', '#582F0E'],
}

export function religionColor(p: LGAProperties): string {
  const rm = p.rm || 0, rc = p.rc || 0, rt = p.rt || 0
  let scale: string[], pct: number
  if (rm >= rc && rm >= rt) { scale = REL_SCALES.muslim; pct = rm }
  else if (rc >= rm && rc >= rt) { scale = REL_SCALES.christian; pct = rc }
  else { scale = REL_SCALES.traditionalist; pct = rt }
  return seqScale(pct, 33, 100, scale)
}

// Ethnicity
const DIV_SCALE = ['#7A3A08', '#B45A14', '#D4870A', '#D09A40', '#6A8A5A', '#2A8B9A']

export const ETH_COLORS: Record<string, string> = {
  // Major groups
  'Hausa': '#D06A10', 'Yoruba': '#4A6FA5', 'Igbo': '#2A8B9A', 'Kanuri': '#7B4EC8',
  'Ijaw': '#6A8A5A', 'Fulani': '#C83838', 'Edo Bini': '#D4870A', 'Tiv': '#8B6914',
  'Hausa Fulani Undiff': '#D06A10',
  // Mid-size groups
  'Ibibio': '#1E88E5', 'Gwari Gbagyi': '#43A047', 'Nupe': '#E8540A',
  'Annang': '#5C6BC0', 'Igala': '#8D6E63', 'Urhobo': '#00897B',
  'Ebira': '#F4511E', 'Idoma': '#3949AB', 'Bura': '#7CB342',
  'Oron': '#039BE5', 'Chamba': '#9E9D24', 'Ekoi': '#E53935',
  'Efik': '#8E24AA', 'Mumuye': '#FF8F00', 'Berom': '#00ACC1',
  'Ikwerre': '#1B5E20', 'Ogoni': '#AD1457', 'Itsekiri': '#6D4C41',
  // Smaller groups
  'Bade': '#C62828', 'Tangale': '#00838F', 'Eket': '#558B2F',
  'Etche': '#7E57C2', 'Kare-Kare': '#D84315', 'Tera': '#00695C',
  'Jukun': '#827717', 'Isoko': '#6A1B9A', 'Bachama': '#0277BD',
  'Tarok Yergam': '#2E7D32', 'Kuteb': '#BF360C', 'Marghi': '#1565C0',
  'Waja': '#795548', 'Obolo': '#B71C1C', 'Bolewa': '#4A148C',
  'Lunguda': '#33691E', 'Kilba Huba': '#E65100', 'Ham Jaba': '#004D40',
  'Angas': '#880E4F', 'Kamwe': '#0D47A1', 'Gude': '#1B5E20',
  'Fali': '#7B1FA2', 'Yungur': '#F57F17', 'Kataf Atyap': '#01579B',
  // Catch-all for data labelled "Other"
  'Other': '#9E9E9E',
}

/** Groups to show in the legend (most common) */
export const ETH_LEGEND_GROUPS = [
  'Hausa', 'Yoruba', 'Igbo', 'Kanuri', 'Ijaw', 'Fulani', 'Edo Bini', 'Tiv',
  'Ibibio', 'Gwari Gbagyi', 'Nupe', 'Annang', 'Igala', 'Urhobo', 'Ebira', 'Idoma',
]

export function diversityColor(p: LGAProperties): string {
  return seqScale(p.ed || 0, 0, 0.85, DIV_SCALE)
}

export function dominantEthColor(p: LGAProperties): string {
  const base = ETH_COLORS[p.eg] || '#888'
  const t = Math.max(0, Math.min(1, ((p.ep || 50) - 20) / 80))
  return hexLerp('#E8D8C0', base, t)
}

export function focusedEthColor(p: LGAProperties, group: string): string {
  if (p.eg === group) {
    const t = Math.max(0, Math.min(1, (p.ep || 0) / 100))
    return hexLerp('#FFFFFF', ETH_COLORS[group] || '#888', t)
  }
  return '#F5F5F5'
}

// Poverty
const POV_SCALE = ['#6A8A5A', '#88AA78', '#D4870A', '#C85A2A', '#C83838']

export function povertyColor(p: LGAProperties): string {
  return seqScale(p.pv || 30, 2, 65, POV_SCALE)
}

// Education
const EDU_SCALE = ['#5A2A0A', '#8B5A2A', '#B45A14', '#6A8A5A', '#2A8B9A', '#38B0C4']

export function eduScore(p: LGAProperties): number {
  return 0.4 * (p.al || 50) + 0.25 * (p.pe || 50) + 0.25 * (p.se || 50) + 0.1 * ((p.gp || 0.7) * 100)
}

export function educationColor(p: LGAProperties): string {
  return seqScale(eduScore(p), 35, 100, EDU_SCALE)
}

// Population
const POP_SCALE = ['#F2E2C6', '#D4A76A', '#B45A14', '#8B3A0A', '#5A1A00']

export function populationColor(p: LGAProperties): string {
  return seqScale(Math.log10(Math.max(p.pop || 20000, 1)), Math.log10(20000), Math.log10(6000000), POP_SCALE)
}

// Bivariate (poverty × education)
const BIVAR = [
  ['#E8D8C0', '#6A8A5A', '#2A8B9A'],
  ['#D4870A', '#888860', '#4A6FA5'],
  ['#C83838', '#7B4EC8', '#5A2A5A'],
]

export function bivariateColor(p: LGAProperties): string {
  const pov = Math.max(0, Math.min(2, Math.floor((p.pv || 30) / 22)))
  const edu = Math.max(0, Math.min(2, Math.floor((eduScore(p) - 35) / 22)))
  return BIVAR[pov][edu]
}

// ---------------------------------------------------------------------------
// Master style function
// ---------------------------------------------------------------------------

export function getLGAFillColor(
  p: LGAProperties,
  mode: ChoroMode,
  ethSubMode: EthSubMode = 'diversity',
  focusedEthGroup?: string | null
): string {
  if (focusedEthGroup && mode === 'ethnicity' && ethSubMode === 'dominant') {
    return focusedEthColor(p, focusedEthGroup)
  }
  switch (mode) {
    case 'religion': return religionColor(p)
    case 'ethnicity': return ethSubMode === 'diversity' ? diversityColor(p) : dominantEthColor(p)
    case 'poverty': return povertyColor(p)
    case 'education': return educationColor(p)
    case 'population': return populationColor(p)
    case 'bivariate': return bivariateColor(p)
    default: return ZONE_COLORS[p.z] || '#222'
  }
}

export function getLGAStyle(
  p: LGAProperties,
  mode: ChoroMode,
  ethSubMode: EthSubMode = 'diversity',
  focusedEthGroup?: string | null
) {
  const isChoro = mode !== 'zones'
  const isFocused = !!(focusedEthGroup && mode === 'ethnicity' && ethSubMode === 'dominant')
  return {
    fillColor: getLGAFillColor(p, mode, ethSubMode, focusedEthGroup),
    fillOpacity: isFocused ? 0.75 : (isChoro ? 0.55 : 0.18),
    color: isChoro ? 'rgba(44,24,16,0.25)' : (ZONE_COLORS[p.z] || '#333'),
    weight: 0.6,
    opacity: isChoro ? 0.4 : 0.3,
  }
}

// ---------------------------------------------------------------------------
// Tooltip content
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

export function getTooltipStat(
  p: LGAProperties,
  mode: ChoroMode,
  ethSubMode: EthSubMode = 'diversity'
): string {
  switch (mode) {
    case 'religion': {
      const maxR = Math.max(p.rm || 0, p.rc || 0, p.rt || 0)
      const rName = (p.rm >= p.rc && p.rm >= p.rt) ? 'Muslim' : (p.rc >= p.rm && p.rc >= p.rt) ? 'Christian' : 'Trad.'
      return `${maxR}% ${rName}`
    }
    case 'ethnicity':
      return ethSubMode === 'diversity'
        ? `ELF: ${(p.ed || 0).toFixed(2)}`
        : `${p.eg || '—'} ${p.ep || 0}%`
    case 'poverty': return `Poverty: ${p.pv || 0}%`
    case 'education': return `Edu: ${eduScore(p).toFixed(0)}`
    case 'population': return `Pop: ${fmt(p.pop)}`
    case 'bivariate': return `Pov ${p.pv || 0}% / Edu ${eduScore(p).toFixed(0)}`
    default: return p.zn || `AZ${p.z}`
  }
}
