'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapControls } from '@/components/map/MapControls'
import { MapLegend } from '@/components/map/MapLegend'
import { MapInfoPanel } from '@/components/map/MapInfoPanel'
import type { ChoroMode, EthSubMode, LGAProperties } from '@/lib/utils/choropleth'

export type SelectionMode = 'zone' | 'state' | 'district' | 'lga'

/** Matches map2.html zoom thresholds */
function getSelectionMode(zoom: number): SelectionMode {
  if (zoom >= 11) return 'lga'
  if (zoom >= 9) return 'district'
  if (zoom >= 8) return 'state'
  return 'zone'
}

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

/** What the user has selected — may be a single LGA, a district, state, or zone */
export interface MapSelection {
  mode: SelectionMode
  /** The key used to filter: LGA name, district id, state name, or zone number */
  key: string
  /** The clicked LGA's properties (always available since clicks are on LGA polygons) */
  clickedLga: LGAProperties
}

export default function MapPage() {
  const [choroMode, setChoroMode] = useState<ChoroMode>('zones')
  const [ethSubMode, setEthSubMode] = useState<EthSubMode>('diversity')
  const [selection, setSelection] = useState<MapSelection | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedEthGroup, setFocusedEthGroup] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('zone')
  const selectionModeRef = useRef<SelectionMode>('zone')

  useEffect(() => { setFocusedEthGroup(null) }, [choroMode, ethSubMode])

  const handleZoomChange = useCallback((zoom: number) => {
    const mode = getSelectionMode(zoom)
    selectionModeRef.current = mode
    setSelectionMode(mode)
  }, [])

  const handleLGAClick = useCallback((lga: LGAProperties | null) => {
    if (!lga) {
      setSelection(null)
      return
    }
    const mode = selectionModeRef.current
    let key: string
    switch (mode) {
      case 'lga': key = lga.n; break
      case 'district': key = lga.d; break
      case 'state': key = lga.s; break
      case 'zone': key = String(lga.z); break
    }
    setSelection({ mode, key, clickedLga: lga })
  }, [])

  /** Navigate from the info panel: e.g. click a state name in zone view → select that state */
  const handleNavigate = useCallback((mode: SelectionMode, key: string, lga: LGAProperties) => {
    setSelection({ mode, key, clickedLga: lga })
  }, [])

  return (
    <div className="fixed inset-0 top-[49px]">
      <NigeriaMap
        choroMode={choroMode}
        ethSubMode={ethSubMode}
        onSelectLGA={handleLGAClick}
        selection={selection}
        searchQuery={searchQuery}
        focusedEthGroup={focusedEthGroup}
        onZoomChange={handleZoomChange}
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
      <MapInfoPanel
        selection={selection}
        onClose={() => setSelection(null)}
        onNavigate={handleNavigate}
      />
      {/* Selection mode indicator */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <span
          className="text-[9px] uppercase tracking-[2px] px-2 py-1 bg-[rgba(242,226,198,0.9)] border border-[rgba(180,90,20,0.15)] text-[rgba(44,24,16,0.5)]"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          Click selects: {selectionMode}
        </span>
      </div>
    </div>
  )
}
