'use client'

import { type LGAProperties, eduScore } from '@/lib/utils/choropleth'

interface MapInfoPanelProps {
  lga: LGAProperties | null
  onClose: () => void
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

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return Math.round(n / 1_000) + 'K'
  return String(n)
}

export function MapInfoPanel({ lga, onClose }: MapInfoPanelProps) {
  if (!lga) return null

  const domReligion = lga.rm >= lga.rc && lga.rm >= lga.rt
    ? `Muslim ${lga.rm}%`
    : lga.rc >= lga.rm && lga.rc >= lga.rt
    ? `Christian ${lga.rc}%`
    : `Trad. ${lga.rt}%`

  return (
    <div
      className="absolute top-3 right-3 z-[1000] w-[280px] bg-[rgba(242,226,198,0.95)] border border-[rgba(180,90,20,0.22)] p-4"
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

      {/* Header */}
      <h2
        className="text-[15px] font-bold text-[#B45A14] tracking-[2px] uppercase mb-0.5"
        style={{ fontFamily: "'Orbitron', monospace" }}
      >
        {lga.n}
      </h2>
      <div className="text-[11px] text-[#2A8B9A] font-medium mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        {lga.s} State · {lga.zn} · {lga.d}
      </div>

      {/* Glow line separator */}
      <div
        className="h-px my-2"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(180,90,20,0.12) 15%, rgba(42,139,154,0.35) 50%, rgba(180,90,20,0.12) 85%, transparent 100%)',
          boxShadow: '0 0 8px rgba(42,139,154,0.1)',
        }}
      />

      {/* Demographics */}
      <div className="space-y-0.5">
        <InfoRow label="Population" value={fmt(lga.pop)} />
        <InfoRow label="Religion" value={domReligion} />
        <InfoRow label="Ethnic Group" value={`${lga.eg} ${lga.ep}%`} />
        <InfoRow label="Diversity" value={lga.ed.toFixed(3)} />
        <InfoRow label="Poverty" value={`${lga.pv}%`} />
        <InfoRow label="Edu Score" value={eduScore(lga).toFixed(0)} />
        <InfoRow label="Literacy" value={`${lga.al}%`} />
        <InfoRow label="Primary Enrol" value={`${lga.pe}%`} />
        <InfoRow label="Secondary Enrol" value={`${lga.se}%`} />
        <InfoRow label="Gender Parity" value={lga.gp.toFixed(2)} />
      </div>
    </div>
  )
}
