'use client'

import { useEffect, useState, useCallback } from 'react'
import { type LGAProperties, eduScore, ZONE_GLOW } from '@/lib/utils/choropleth'
import type { MapSelection, SelectionMode } from '@/app/map/page'

// --- Cached LGA index for aggregation ---

let lgaCache: LGAProperties[] | null = null
async function loadAllLGAs(): Promise<LGAProperties[]> {
  if (lgaCache) return lgaCache
  const res = await fetch('/geo/lga.geojson')
  const data = await res.json()
  lgaCache = (data.features as { properties: LGAProperties }[]).map((f) => f.properties)
  return lgaCache
}

interface MapInfoPanelProps {
  selection: MapSelection | null
  onClose: () => void
  onNavigate: (mode: SelectionMode, key: string, lga: LGAProperties) => void
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="text-[10px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px]" style={{ fontFamily: "'Orbitron', monospace" }}>
        {label}
      </span>
      <span className="text-[13px] text-[#2C1810] font-semibold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        {value}
      </span>
    </div>
  )
}

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] text-[#2A8B9A] hover:text-[#B45A14] transition-colors cursor-pointer underline underline-offset-2"
      style={{ fontFamily: "'Rajdhani', sans-serif" }}
    >
      {label}
    </button>
  )
}

function GlowLine() {
  return (
    <div
      className="h-px my-2"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(180,90,20,0.12) 15%, rgba(42,139,154,0.35) 50%, rgba(180,90,20,0.12) 85%, transparent 100%)',
        boxShadow: '0 0 8px rgba(42,139,154,0.1)',
      }}
    />
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return Math.round(n / 1_000) + 'K'
  return String(n)
}

/** Aggregate stats from a set of LGAs */
function aggregate(lgas: LGAProperties[]) {
  const totalPop = lgas.reduce((s, l) => s + l.pop, 0)
  const states = [...new Set(lgas.map((l) => l.s))].sort()
  const districts = [...new Set(lgas.map((l) => l.d))].sort()
  const zones = [...new Set(lgas.map((l) => l.z))].sort()

  // Weighted averages
  const wAvg = (fn: (l: LGAProperties) => number) =>
    totalPop > 0 ? lgas.reduce((s, l) => s + fn(l) * l.pop, 0) / totalPop : 0

  const avgMuslim = wAvg((l) => l.rm)
  const avgChristian = wAvg((l) => l.rc)
  const avgTraditional = wAvg((l) => l.rt)
  const avgPoverty = wAvg((l) => l.pv)
  const avgLiteracy = wAvg((l) => l.al)

  // Top ethnic groups
  const ethCounts: Record<string, number> = {}
  for (const l of lgas) {
    ethCounts[l.eg] = (ethCounts[l.eg] || 0) + l.pop * (l.ep / 100)
  }
  const topEth = Object.entries(ethCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, pop]) => ({ name, pct: totalPop > 0 ? (pop / totalPop) * 100 : 0 }))

  return { totalPop, states, districts, zones, avgMuslim, avgChristian, avgTraditional, avgPoverty, avgLiteracy, topEth, count: lgas.length }
}

export function MapInfoPanel({ selection, onClose, onNavigate }: MapInfoPanelProps) {
  const [allLGAs, setAllLGAs] = useState<LGAProperties[]>([])

  useEffect(() => { loadAllLGAs().then(setAllLGAs) }, [])

  const getMatchingLGAs = useCallback((sel: MapSelection): LGAProperties[] => {
    if (!allLGAs.length) return []
    switch (sel.mode) {
      case 'lga': return allLGAs.filter((l) => l.n === sel.key && l.s === sel.clickedLga.s)
      case 'district': return allLGAs.filter((l) => l.d === sel.key)
      case 'state': return allLGAs.filter((l) => l.s === sel.key)
      case 'zone': return allLGAs.filter((l) => String(l.z) === sel.key)
    }
  }, [allLGAs])

  if (!selection) return null

  const lga = selection.clickedLga
  const matchingLGAs = getMatchingLGAs(selection)
  const stats = selection.mode !== 'lga' ? aggregate(matchingLGAs) : null

  // Find a representative LGA for navigation (first one in the filtered set)
  const findRepLga = (mode: SelectionMode, key: string) =>
    allLGAs.find((l) => {
      if (mode === 'state') return l.s === key
      if (mode === 'district') return l.d === key
      if (mode === 'zone') return String(l.z) === key
      return l.n === key
    })

  return (
    <div
      className="absolute top-3 right-3 z-[1000] w-[280px] max-h-[calc(100vh-120px)] overflow-y-auto bg-[rgba(242,226,198,0.95)] border border-[rgba(180,90,20,0.22)] p-4"
      style={{
        clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
        boxShadow: '0 2px 24px rgba(160,80,20,0.1), 0 0 12px rgba(42,139,154,0.04)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-3 text-[rgba(42,139,154,0.3)] hover:text-[#2A8B9A] text-lg leading-none transition-colors"
      >
        ×
      </button>

      {/* === LGA Mode === */}
      {selection.mode === 'lga' && (
        <>
          <h2
            className="text-[15px] font-bold text-[#B45A14] tracking-[2px] uppercase mb-0.5"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {lga.n}
          </h2>
          <div className="text-[11px] text-[#2A8B9A] font-medium mb-1 space-x-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            <NavLink label={lga.s + ' State'} onClick={() => {
              onNavigate('state', lga.s, lga)
            }} />
            <span>·</span>
            <NavLink label={lga.zn} onClick={() => {
              onNavigate('zone', String(lga.z), lga)
            }} />
            <span>·</span>
            <NavLink label={lga.d} onClick={() => {
              onNavigate('district', lga.d, lga)
            }} />
          </div>
          <GlowLine />
          <div className="space-y-0.5">
            <InfoRow label="Population" value={fmt(lga.pop)} />
            <InfoRow label="Religion" value={
              lga.rm >= lga.rc && lga.rm >= lga.rt ? `Muslim ${lga.rm}%`
              : lga.rc >= lga.rm && lga.rc >= lga.rt ? `Christian ${lga.rc}%`
              : `Trad. ${lga.rt}%`
            } />
            <InfoRow label="Ethnic Group" value={`${lga.eg} ${lga.ep}%`} />
            <InfoRow label="Diversity" value={lga.ed.toFixed(3)} />
            <InfoRow label="Poverty" value={`${lga.pv}%`} />
            <InfoRow label="Edu Score" value={eduScore(lga).toFixed(0)} />
            <InfoRow label="Literacy" value={`${lga.al}%`} />
            <InfoRow label="Primary Enrol" value={`${lga.pe}%`} />
            <InfoRow label="Secondary Enrol" value={`${lga.se}%`} />
            <InfoRow label="Gender Parity" value={lga.gp.toFixed(2)} />
          </div>
        </>
      )}

      {/* === District Mode === */}
      {selection.mode === 'district' && stats && (
        <>
          <h2
            className="text-[15px] font-bold text-[#B45A14] tracking-[2px] uppercase mb-0.5"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {selection.key}
          </h2>
          <div className="text-[11px] text-[#2A8B9A] font-medium mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            <NavLink label={lga.zn} onClick={() => {
              onNavigate('zone', String(lga.z), lga)
            }} />
            <span className="mx-1">·</span>
            <span>{stats.count} LGAs</span>
          </div>
          <GlowLine />
          <div className="space-y-0.5">
            <InfoRow label="Population" value={fmt(stats.totalPop)} />
            <InfoRow label="LGAs" value={stats.count} />
            <InfoRow label="Muslim" value={`${stats.avgMuslim.toFixed(0)}%`} />
            <InfoRow label="Christian" value={`${stats.avgChristian.toFixed(0)}%`} />
            <InfoRow label="Poverty" value={`${stats.avgPoverty.toFixed(0)}%`} />
            <InfoRow label="Literacy" value={`${stats.avgLiteracy.toFixed(0)}%`} />
          </div>
          {stats.topEth.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                Top Ethnic Groups
              </div>
              {stats.topEth.map((e) => (
                <div key={e.name} className="flex justify-between text-[11px]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <span className="text-[#2C1810]">{e.name}</span>
                  <span className="text-[rgba(44,24,16,0.5)]">{e.pct.toFixed(0)}%</span>
                </div>
              ))}
            </>
          )}
          {stats.states.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                States
              </div>
              <div className="flex flex-wrap gap-1">
                {stats.states.map((s) => {
                  const rep = findRepLga('state', s)
                  return rep ? (
                    <NavLink key={s} label={s} onClick={() => onNavigate('state', s, rep)} />
                  ) : (
                    <span key={s} className="text-[11px] text-[#2C1810]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s}</span>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* === State Mode === */}
      {selection.mode === 'state' && stats && (
        <>
          <h2
            className="text-[15px] font-bold text-[#B45A14] tracking-[2px] uppercase mb-0.5"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            {selection.key} State
          </h2>
          <div className="text-[11px] text-[#2A8B9A] font-medium mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            <NavLink label={lga.zn} onClick={() => {
              onNavigate('zone', String(lga.z), lga)
            }} />
            <span className="mx-1">·</span>
            <span>{stats.count} LGAs · {stats.districts.length} Districts</span>
          </div>
          <GlowLine />
          <div className="space-y-0.5">
            <InfoRow label="Population" value={fmt(stats.totalPop)} />
            <InfoRow label="LGAs" value={stats.count} />
            <InfoRow label="Districts" value={stats.districts.length} />
            <InfoRow label="Muslim" value={`${stats.avgMuslim.toFixed(0)}%`} />
            <InfoRow label="Christian" value={`${stats.avgChristian.toFixed(0)}%`} />
            <InfoRow label="Poverty" value={`${stats.avgPoverty.toFixed(0)}%`} />
            <InfoRow label="Literacy" value={`${stats.avgLiteracy.toFixed(0)}%`} />
          </div>
          {stats.topEth.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                Top Ethnic Groups
              </div>
              {stats.topEth.map((e) => (
                <div key={e.name} className="flex justify-between text-[11px]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <span className="text-[#2C1810]">{e.name}</span>
                  <span className="text-[rgba(44,24,16,0.5)]">{e.pct.toFixed(0)}%</span>
                </div>
              ))}
            </>
          )}
          {stats.districts.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                Districts
              </div>
              <div className="flex flex-wrap gap-1">
                {stats.districts.map((d) => {
                  const rep = findRepLga('district', d)
                  return rep ? (
                    <NavLink key={d} label={d} onClick={() => onNavigate('district', d, rep)} />
                  ) : (
                    <span key={d} className="text-[11px] text-[#2C1810]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{d}</span>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* === Zone Mode === */}
      {selection.mode === 'zone' && stats && (
        <>
          <h2
            className="text-[15px] font-bold tracking-[2px] uppercase mb-0.5"
            style={{ fontFamily: "'Orbitron', monospace", color: ZONE_GLOW[lga.z] || '#B45A14' }}
          >
            AZ{lga.z} — {lga.zn}
          </h2>
          <div className="text-[11px] text-[#2A8B9A] font-medium mb-1" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {stats.states.length} States · {stats.districts.length} Districts · {stats.count} LGAs
          </div>
          <GlowLine />
          <div className="space-y-0.5">
            <InfoRow label="Population" value={fmt(stats.totalPop)} />
            <InfoRow label="LGAs" value={stats.count} />
            <InfoRow label="Districts" value={stats.districts.length} />
            <InfoRow label="States" value={stats.states.length} />
            <InfoRow label="Muslim" value={`${stats.avgMuslim.toFixed(0)}%`} />
            <InfoRow label="Christian" value={`${stats.avgChristian.toFixed(0)}%`} />
            <InfoRow label="Poverty" value={`${stats.avgPoverty.toFixed(0)}%`} />
            <InfoRow label="Literacy" value={`${stats.avgLiteracy.toFixed(0)}%`} />
          </div>
          {stats.topEth.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                Top Ethnic Groups
              </div>
              {stats.topEth.map((e) => (
                <div key={e.name} className="flex justify-between text-[11px]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  <span className="text-[#2C1810]">{e.name}</span>
                  <span className="text-[rgba(44,24,16,0.5)]">{e.pct.toFixed(0)}%</span>
                </div>
              ))}
            </>
          )}
          {stats.states.length > 0 && (
            <>
              <GlowLine />
              <div className="text-[9px] text-[rgba(44,24,16,0.45)] uppercase tracking-[1px] mb-1" style={{ fontFamily: "'Orbitron', monospace" }}>
                States
              </div>
              <div className="flex flex-wrap gap-1">
                {stats.states.map((s) => {
                  const rep = findRepLga('state', s)
                  return rep ? (
                    <NavLink key={s} label={s} onClick={() => onNavigate('state', s, rep)} />
                  ) : (
                    <span key={s} className="text-[11px] text-[#2C1810]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s}</span>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
