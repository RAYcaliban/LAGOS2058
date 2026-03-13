'use client'

import { type ChoroMode, type EthSubMode, ZONE_COLORS, ETH_COLORS, ETH_LEGEND_GROUPS } from '@/lib/utils/choropleth'

interface MapLegendProps {
  mode: ChoroMode
  ethSubMode: EthSubMode
  focusedEthGroup?: string | null
  onFocusEthGroup?: (group: string | null) => void
}

const ZONE_NAMES: Record<number, string> = {
  1: 'Federal Capital', 2: 'Niger', 3: 'Confluence', 4: 'Littoral',
  5: 'Eastern', 6: 'Central', 7: 'Chad', 8: 'Savanna',
}

const BIVAR = [
  ['#E8D8C0', '#6A8A5A', '#2A8B9A'],
  ['#D4870A', '#888860', '#4A6FA5'],
  ['#C83838', '#7B4EC8', '#5A2A5A'],
]

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-0.5 text-[rgba(44,24,16,0.6)] font-medium text-[11px]">
      <div
        className="w-3 h-3.5 shadow-[0_0_6px_currentColor]"
        style={{
          background: color,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />
      {label}
    </div>
  )
}

function GradientBar({ colors, minL, maxL, caption }: { colors: string[]; minL: string; maxL: string; caption: string }) {
  return (
    <div className="my-1.5">
      <div
        className="h-2.5 rounded-sm mb-0.5"
        style={{ background: `linear-gradient(90deg, ${colors.join(',')})` }}
      />
      <div className="flex justify-between text-[9px] text-[rgba(44,24,16,0.45)]">
        <span>{minL}</span><span>{maxL}</span>
      </div>
      <div
        className="text-center text-[8px] text-[rgba(42,139,154,0.5)] mt-0.5"
        style={{ letterSpacing: '1px', fontFamily: "'Orbitron', monospace" }}
      >
        {caption}
      </div>
    </div>
  )
}

export function MapLegend({ mode, ethSubMode, focusedEthGroup, onFocusEthGroup }: MapLegendProps) {
  let title = 'Admin Zones'
  let content: React.ReactNode = null

  if (mode === 'zones') {
    content = (
      <>
        {Object.entries(ZONE_NAMES).map(([z, name]) => (
          <Swatch key={z} color={ZONE_COLORS[Number(z)]} label={name} />
        ))}
      </>
    )
  } else if (mode === 'religion') {
    title = 'Dominant Religion'
    content = (
      <>
        <Swatch color="#2D6A4F" label="Muslim" />
        <Swatch color="#1D3557" label="Christian" />
        <Swatch color="#7F4F24" label="Traditionalist" />
        <GradientBar colors={['#DDB892', '#52B788', '#2D6A4F']} minL="33%" maxL="100%" caption="Dominance" />
      </>
    )
  } else if (mode === 'ethnicity') {
    if (ethSubMode === 'diversity') {
      title = 'Ethnic Diversity (ELF)'
      content = <GradientBar colors={['#7A3A08', '#D4870A', '#6A8A5A', '#2A8B9A']} minL="0.0" maxL="0.85" caption="Homogeneous → Diverse" />
    } else {
      title = 'Dominant Ethnic Group (CLICKABLE!)'
      const isInteractive = !!(onFocusEthGroup)
      content = (
        <>
          {ETH_LEGEND_GROUPS.map((g) => {
            const isActive = focusedEthGroup === g
            const isDimmed = focusedEthGroup && !isActive
            return isInteractive ? (
              <button
                key={g}
                type="button"
                className="flex items-center gap-2.5 py-0.5 text-[11px] font-medium w-full text-left transition-opacity"
                style={{
                  color: 'rgba(44,24,16,0.6)',
                  opacity: isDimmed ? 0.4 : 1,
                  background: 'none',
                  border: 'none',
                  padding: '2px 0',
                  cursor: 'pointer',
                }}
                onClick={() => onFocusEthGroup(isActive ? null : g)}
              >
                <div
                  className="w-3 h-3.5 flex-shrink-0"
                  style={{
                    background: ETH_COLORS[g],
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                    boxShadow: isActive ? `0 0 6px ${ETH_COLORS[g]}, 0 0 0 1.5px ${ETH_COLORS[g]}` : '0 0 6px currentColor',
                  }}
                />
                {g}
              </button>
            ) : (
              <Swatch key={g} color={ETH_COLORS[g]} label={g} />
            )
          })}
        </>
      )
    }
  } else if (mode === 'poverty') {
    title = 'Poverty Rate'
    content = <GradientBar colors={['#6A8A5A', '#D4870A', '#C83838']} minL="2%" maxL="65%" caption="Low → High" />
  } else if (mode === 'education') {
    title = 'Education Score'
    content = <GradientBar colors={['#5A2A0A', '#B45A14', '#2A8B9A', '#38B0C4']} minL="35" maxL="100" caption="Low → High" />
  } else if (mode === 'population') {
    title = 'Population'
    content = <GradientBar colors={['#F2E2C6', '#D4A76A', '#B45A14', '#8B3A0A', '#5A1A00']} minL="20K" maxL="6M" caption="Log Scale" />
  } else if (mode === 'bivariate') {
    title = 'Poverty × Education'
    content = (
      <>
        <div className="text-center text-[8px] text-[rgba(42,139,154,0.5)] mb-0.5" style={{ letterSpacing: '1px', fontFamily: "'Orbitron', monospace" }}>
          ← Education →
        </div>
        <div className="flex items-center gap-1">
          <div className="text-[8px] text-[rgba(44,24,16,0.45)]" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontFamily: "'Orbitron', monospace", letterSpacing: '1px' }}>
            Poverty →
          </div>
          <div className="grid grid-cols-3 gap-0.5">
            {BIVAR.flat().map((c, i) => (
              <div
                key={i}
                className="w-7 h-7"
                style={{
                  background: c,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div
      className="absolute bottom-3 left-14 z-[1000] w-[180px] bg-[rgba(242,226,198,0.95)] border border-[rgba(180,90,20,0.22)] p-3"
      style={{
        clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
        boxShadow: '0 2px 24px rgba(160,80,20,0.1)',
      }}
    >
      <h3
        className="text-[7px] uppercase tracking-[4px] text-[rgba(42,139,154,0.5)] mb-2"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        {title}
      </h3>
      {content}
    </div>
  )
}
