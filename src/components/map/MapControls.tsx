'use client'

import { type ChoroMode, type EthSubMode } from '@/lib/utils/choropleth'

interface MapControlsProps {
  mode: ChoroMode
  ethSubMode: EthSubMode
  onModeChange: (mode: ChoroMode) => void
  onEthSubModeChange: (sub: EthSubMode) => void
  searchQuery: string
  onSearchChange: (q: string) => void
}

const MODES: { key: ChoroMode; label: string }[] = [
  { key: 'zones', label: 'Admin Zones' },
  { key: 'religion', label: 'Religion' },
  { key: 'ethnicity', label: 'Ethnicity' },
  { key: 'poverty', label: 'Poverty' },
  { key: 'education', label: 'Education' },
  { key: 'population', label: 'Population' },
  { key: 'bivariate', label: 'Poverty × Edu' },
]

export function MapControls({
  mode, ethSubMode, onModeChange, onEthSubModeChange, searchQuery, onSearchChange,
}: MapControlsProps) {
  return (
    <div className="absolute top-3 left-14 z-[1000] w-[220px] space-y-2">
      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search LGA, state, zone..."
        className="w-full px-3 py-2 text-sm bg-[rgba(242,226,198,0.95)] text-[#2C1810] border border-[rgba(180,90,20,0.22)] rounded-none placeholder:text-[rgba(42,139,154,0.35)] focus:outline-none focus:border-[#2A8B9A]"
        style={{
          clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))',
          fontFamily: "'Rajdhani', sans-serif",
        }}
      />

      {/* Choropleth mode selector */}
      <div
        className="bg-[rgba(242,226,198,0.95)] border border-[rgba(180,90,20,0.22)] p-3"
        style={{
          clipPath: 'polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))',
          boxShadow: '0 2px 24px rgba(160,80,20,0.1)',
        }}
      >
        <h3
          className="text-[7px] uppercase tracking-[4px] text-[rgba(42,139,154,0.5)] mb-2"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          Choropleth
        </h3>

        <div className="space-y-0.5">
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              className={`block w-full text-left px-2 py-1 text-[11px] font-medium transition-colors border-l-2 ${
                mode === key
                  ? 'text-[#B45A14] border-[#B45A14] bg-[rgba(180,90,20,0.06)]'
                  : 'text-[rgba(44,24,16,0.5)] border-transparent hover:text-[#2A8B9A] hover:border-[rgba(42,139,154,0.3)]'
              }`}
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Ethnicity sub-mode */}
        {mode === 'ethnicity' && (
          <div className="mt-2 pl-3 space-y-0.5">
            {(['diversity', 'dominant'] as EthSubMode[]).map((sub) => (
              <label
                key={sub}
                className="flex items-center gap-1.5 text-[10px] text-[rgba(44,24,16,0.45)] cursor-pointer hover:text-[#2A8B9A]"
              >
                <input
                  type="radio"
                  name="ethSub"
                  checked={ethSubMode === sub}
                  onChange={() => onEthSubModeChange(sub)}
                  className="w-2.5 h-2.5"
                  style={{ accentColor: '#2A8B9A' }}
                />
                {sub === 'diversity' ? 'Diversity Index' : 'Dominant Group'}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
