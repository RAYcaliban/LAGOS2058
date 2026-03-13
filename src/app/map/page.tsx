'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapControls } from '@/components/map/MapControls'
import { MapLegend } from '@/components/map/MapLegend'
import { MapInfoPanel } from '@/components/map/MapInfoPanel'
import type { ChoroMode, EthSubMode, LGAProperties } from '@/lib/utils/choropleth'

const NigeriaMap = dynamic(() => import('@/components/map/NigeriaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F2E2C6]">
      <div className="text-[#2A8B9A] text-sm tracking-[4px] uppercase" style={{ fontFamily: "'Orbitron', monospace" }}>
        Loading map...
      </div>
    </div>
  ),
})

export default function MapPage() {
  const [choroMode, setChoroMode] = useState<ChoroMode>('zones')
  const [ethSubMode, setEthSubMode] = useState<EthSubMode>('diversity')
  const [selectedLGA, setSelectedLGA] = useState<LGAProperties | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedEthGroup, setFocusedEthGroup] = useState<string | null>(null)

  useEffect(() => { setFocusedEthGroup(null) }, [choroMode, ethSubMode])

  return (
    <div className="fixed inset-0 top-[49px]">
      <NigeriaMap
        choroMode={choroMode}
        ethSubMode={ethSubMode}
        onSelectLGA={setSelectedLGA}
        selectedLGA={selectedLGA?.n ?? null}
        searchQuery={searchQuery}
        focusedEthGroup={focusedEthGroup}
      />
      <MapControls
        mode={choroMode}
        ethSubMode={ethSubMode}
        onModeChange={setChoroMode}
        onEthSubModeChange={setEthSubMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <MapLegend
        mode={choroMode}
        ethSubMode={ethSubMode}
        focusedEthGroup={focusedEthGroup}
        onFocusEthGroup={setFocusedEthGroup}
      />
      <MapInfoPanel lga={selectedLGA} onClose={() => setSelectedLGA(null)} />
    </div>
  )
}
