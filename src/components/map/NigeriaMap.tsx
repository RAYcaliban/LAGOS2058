'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import {
  type ChoroMode, type EthSubMode, type LGAProperties,
  getLGAStyle, getTooltipStat, ZONE_GLOW,
} from '@/lib/utils/choropleth'
import type { MapSelection } from '@/app/map/page'

// --- Types ---

interface NigeriaMapProps {
  choroMode: ChoroMode
  ethSubMode: EthSubMode
  onSelectLGA: (properties: LGAProperties | null) => void
  selection: MapSelection | null
  searchQuery: string
  focusedEthGroup?: string | null
  onZoomChange?: (zoom: number) => void
}

interface GeoData {
  lga: GeoJSON.FeatureCollection | null
  states: GeoJSON.FeatureCollection | null
  districts: GeoJSON.FeatureCollection | null
  zones: GeoJSON.FeatureCollection | null
  mask: GeoJSON.FeatureCollection | null
  lgaCenters: { n: string; lat: number; lon: number }[]
  zoneCenters: { n: string; fn: string; z: number; lat: number; lon: number }[]
  capitals: { name: string; lat: number; lon: number }[]
}

const MAP_CENTER: L.LatLngTuple = [9.0, 8.0]
const MAX_BOUNDS: L.LatLngBoundsExpression = [[3, 2], [14.5, 15]]
const PARCHMENT = '#F2E2C6'
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'

async function fetchGeoData(): Promise<GeoData> {
  const j = (u: string) => fetch(u).then((r) => r.json())
  const [lga, states, districts, zones, mask, lgaCenters, zoneCenters, capitals] =
    await Promise.all([
      j('/geo/lga.geojson'), j('/geo/states.geojson'), j('/geo/districts.geojson'),
      j('/geo/zones.geojson'), j('/geo/mask.geojson'), j('/geo/lga_centers.json'),
      j('/geo/zone_centers.json'), j('/geo/capitals.json'),
    ])
  return { lga, states, districts, zones, mask, lgaCenters, zoneCenters, capitals }
}

// --- Helpers: match predicates for each selection mode ---

function lgaMatchesSel(p: LGAProperties, sel: MapSelection): boolean {
  switch (sel.mode) {
    case 'lga': return p.n === sel.key && p.s === sel.clickedLga.s
    case 'district': return p.d === sel.key
    case 'state': return p.s === sel.key
    case 'zone': return String(p.z) === sel.key
  }
}

// --- MapController: fly-to-search + zoom-dependent overlays ---

function MapController({ searchQuery, data, isDragging, onZoomChange }: {
  searchQuery: string; data: GeoData; isDragging: React.MutableRefObject<boolean>; onZoomChange?: (zoom: number) => void
}) {
  const map = useMap()
  const zoneLayerRef = useRef<L.LayerGroup>(L.layerGroup())
  const capitalLayerRef = useRef<L.LayerGroup>(L.layerGroup())

  // Fly to searched LGA
  useEffect(() => {
    if (!searchQuery.trim() || !data.lgaCenters.length) return
    const q = searchQuery.toLowerCase()
    const match = data.lgaCenters.find((c) => c.n.toLowerCase().includes(q))
    if (match) map.flyTo([match.lat, match.lon], 9, { duration: 1 })
  }, [searchQuery, data.lgaCenters, map])

  // Zoom-dependent zone labels and capital markers
  useEffect(() => {
    const zoneGroup = zoneLayerRef.current
    const capitalGroup = capitalLayerRef.current
    zoneGroup.addTo(map)
    capitalGroup.addTo(map)

    function updateOverlays() {
      const zoom = map.getZoom()
      zoneGroup.clearLayers()
      if (zoom >= 6) {
        data.zoneCenters.forEach((zc) => {
          const icon = L.divIcon({
            className: 'zone-label',
            html: `<span style="font-family:'Orbitron',monospace;font-size:${zoom >= 8 ? 10 : 8}px;font-weight:600;color:${ZONE_GLOW[zc.z] || '#888'};text-shadow:0 0 4px rgba(0,0,0,0.15);white-space:nowrap;pointer-events:none;opacity:0.7">${zc.fn}</span>`,
            iconSize: [0, 0], iconAnchor: [0, 0],
          })
          L.marker([zc.lat, zc.lon], { icon, interactive: false }).addTo(zoneGroup)
        })
      }
      capitalGroup.clearLayers()
      if (zoom >= 8) {
        data.capitals.forEach((cap) => {
          const icon = L.divIcon({
            className: 'capital-marker',
            html: `<span style="display:inline-block;width:8px;height:8px;background:#2C1810;transform:rotate(45deg);border:1px solid ${PARCHMENT};opacity:0.7"></span>`,
            iconSize: [8, 8], iconAnchor: [4, 4],
          })
          L.marker([cap.lat, cap.lon], { icon, interactive: false })
            .bindTooltip(cap.name, { permanent: false, direction: 'top', offset: [0, -6] })
            .addTo(capitalGroup)
        })
      }
    }

    function handleZoom() {
      updateOverlays()
      onZoomChange?.(map.getZoom())
    }

    map.on('zoomend', handleZoom)
    updateOverlays()
    onZoomChange?.(map.getZoom())

    const onDragStart = () => { isDragging.current = true }
    const onDragEnd = () => { setTimeout(() => { isDragging.current = false }, 50) }
    map.on('dragstart', onDragStart)
    map.on('dragend', onDragEnd)

    return () => {
      map.off('zoomend', handleZoom)
      map.off('dragstart', onDragStart)
      map.off('dragend', onDragEnd)
      zoneGroup.remove(); capitalGroup.remove()
    }
  }, [map, data.zoneCenters, data.capitals, isDragging, onZoomChange])

  return null
}

// --- NigeriaMap ---

export default function NigeriaMap({
  choroMode, ethSubMode, onSelectLGA, selection, searchQuery, focusedEthGroup, onZoomChange,
}: NigeriaMapProps) {
  const [data, setData] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const lgaLayerRef = useRef<L.GeoJSON | null>(null)
  const isDragging = useRef(false)
  const hlActive = useRef(false)
  const selectionRef = useRef<MapSelection | null>(null)
  const hlBorderLayerRef = useRef<L.Layer | null>(null)
  const hlBorderGroupRef = useRef<L.GeoJSON | null>(null)
  const districtLayerRef = useRef<L.GeoJSON | null>(null)
  const zoneLayerRef = useRef<L.GeoJSON | null>(null)
  const stateLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => { fetchGeoData().then((d) => { setData(d); setLoading(false) }) }, [])

  // Keep selection ref in sync
  useEffect(() => { selectionRef.current = selection }, [selection])

  // Re-style LGA layers when mode changes
  useEffect(() => {
    const layer = lgaLayerRef.current
    if (!layer) return
    layer.eachLayer((l) => {
      const feat = l as L.Layer & { feature?: GeoJSON.Feature }
      if (feat.feature) {
        ;(l as L.Path).setStyle(getLGAStyle(feat.feature.properties as LGAProperties, choroMode, ethSubMode, focusedEthGroup))
      }
    })
  }, [choroMode, ethSubMode, focusedEthGroup])

  // Highlight selection: dim unmatched LGAs, brighten matched, highlight border
  useEffect(() => {
    const lgaLayer = lgaLayerRef.current
    if (!lgaLayer) return

    // Clear previous highlight
    if (hlActive.current) {
      lgaLayer.eachLayer((l) => {
        const feat = l as L.Layer & { feature?: GeoJSON.Feature }
        if (feat.feature) {
          ;(l as L.Path).setStyle(getLGAStyle(feat.feature.properties as LGAProperties, choroMode, ethSubMode, focusedEthGroup))
        }
      })
      // Reset border layers
      const resetBorder = (layerGroup: L.GeoJSON | null) => {
        layerGroup?.eachLayer((l) => {
          layerGroup.resetStyle(l)
        })
      }
      resetBorder(districtLayerRef.current)
      resetBorder(zoneLayerRef.current)
      resetBorder(stateLayerRef.current)
      hlBorderLayerRef.current = null
      hlBorderGroupRef.current = null
      hlActive.current = false
    }

    if (!selection) return

    // Dim unmatched, brighten matched
    hlActive.current = true
    lgaLayer.eachLayer((l) => {
      const feat = l as L.Layer & { feature?: GeoJSON.Feature }
      if (!feat.feature) return
      const p = feat.feature.properties as LGAProperties
      if (lgaMatchesSel(p, selection)) {
        const baseStyle = getLGAStyle(p, choroMode, ethSubMode, focusedEthGroup)
        const glowColor = choroMode === 'zones' ? (ZONE_GLOW[p.z] || '#B45A14') : baseStyle.color
        ;(l as L.Path).setStyle({
          fillColor: baseStyle.fillColor,
          fillOpacity: 0.65,
          weight: 1.8,
          color: glowColor,
          opacity: 0.9,
        })
      } else {
        ;(l as L.Path).setStyle({
          fillOpacity: 0.03,
          weight: 0.3,
          color: '#C8B090',
          opacity: 0.12,
        })
      }
    })

    // Highlight border for district/state/zone
    const highlightBorder = (layerGroup: L.GeoJSON | null, pred: (f: GeoJSON.Feature) => boolean) => {
      if (!layerGroup) return
      layerGroup.eachLayer((l) => {
        const feat = l as L.Layer & { feature?: GeoJSON.Feature }
        if (feat.feature && pred(feat.feature)) {
          ;(l as L.Path).setStyle({ weight: 4, opacity: 1, color: '#B45A14', dashArray: '' })
          ;(l as L.Path).bringToFront()
          hlBorderLayerRef.current = l
          hlBorderGroupRef.current = layerGroup
        } else {
          ;(l as L.Path).setStyle({ opacity: 0.1 })
        }
      })
    }

    switch (selection.mode) {
      case 'district':
        highlightBorder(districtLayerRef.current, (f) => f.properties?.d === selection.key)
        break
      case 'state':
        highlightBorder(stateLayerRef.current, (f) => f.properties?.n === selection.key)
        break
      case 'zone':
        highlightBorder(zoneLayerRef.current, (f) => String(f.properties?.z) === selection.key)
        break
    }
  }, [selection, choroMode, ethSubMode, focusedEthGroup])

  // Memoized style functions
  const lgaStyle = useMemo(
    () => (feature?: GeoJSON.Feature) => {
      if (!feature) return {}
      return getLGAStyle(feature.properties as LGAProperties, choroMode, ethSubMode, focusedEthGroup)
    },
    [choroMode, ethSubMode, focusedEthGroup]
  )

  const maskStyle = useMemo(() => () => ({
    fillColor: PARCHMENT, fillOpacity: 1, color: PARCHMENT, weight: 0, interactive: false,
  }), [])

  const districtStyle = useMemo(() => () => ({
    fill: false, color: '#888', weight: 1, opacity: 0.4, dashArray: '4 4', interactive: false,
  }), [])

  const stateStyle = useMemo(() => () => ({
    fill: false, color: '#666', weight: 1.5, opacity: 0.3, interactive: false,
  }), [])

  const zoneStyle = useMemo(() => (feature?: GeoJSON.Feature) => {
    const z = feature?.properties?.z as number | undefined
    return { fill: false, color: ZONE_GLOW[z ?? 0] || '#666', weight: 2, opacity: 0.6, interactive: false }
  }, [])

  const onEachLGA = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const p = feature.properties as LGAProperties
      const path = layer as L.Path
      layer.on({
        mouseover: () => {
          if (isDragging.current) return
          const sel = selectionRef.current
          // Only apply hover effect if no highlight active, or this LGA is in the selection
          if (!hlActive.current || (sel && lgaMatchesSel(p, sel))) {
            path.setStyle({ weight: 3, color: '#2A8B9A', fillOpacity: 0.75 })
            path.bringToFront()
          }
          path.bindTooltip(`<b>${p.n}</b><br/>${p.s} · ${p.zn}<br/>${getTooltipStat(p, choroMode, ethSubMode)}`, {
            sticky: true, className: 'lga-tooltip',
          })
          path.openTooltip()
        },
        mouseout: () => {
          const sel = selectionRef.current
          // Restore appropriate style based on current highlight state
          if (hlActive.current && sel) {
            if (lgaMatchesSel(p, sel)) {
              const baseStyle = getLGAStyle(p, choroMode, ethSubMode, focusedEthGroup)
              const glowColor = choroMode === 'zones' ? (ZONE_GLOW[p.z] || '#B45A14') : baseStyle.color
              path.setStyle({ fillColor: baseStyle.fillColor, fillOpacity: 0.65, weight: 1.8, color: glowColor, opacity: 0.9 })
            } else {
              path.setStyle({ fillOpacity: 0.03, weight: 0.3, color: '#C8B090', opacity: 0.12 })
            }
          } else {
            path.setStyle(getLGAStyle(p, choroMode, ethSubMode, focusedEthGroup))
          }
          path.unbindTooltip()
        },
        click: () => {
          if (isDragging.current) return
          onSelectLGA(p)
        },
      })
    },
    [choroMode, ethSubMode, onSelectLGA, focusedEthGroup]
  )

  const lgaKey = `lga-${choroMode}-${ethSubMode}-${focusedEthGroup}`

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: PARCHMENT }}>
        <p className="text-sm tracking-[3px] uppercase animate-pulse"
          style={{ color: 'rgba(44,24,16,0.35)', fontFamily: "'Orbitron', monospace" }}>
          Loading map data...
        </p>
      </div>
    )
  }

  return (
    <MapContainer
      center={MAP_CENTER} zoom={6} maxBounds={MAX_BOUNDS} maxBoundsViscosity={1.0}
      zoomControl={false} style={{ width: '100%', height: '100%', background: PARCHMENT }}
    >
      <TileLayer url={TILE_URL} attribution="" />
      {data.mask && <GeoJSON data={data.mask} style={maskStyle} interactive={false} />}
      {data.lga && (
        <GeoJSON key={lgaKey} data={data.lga} style={lgaStyle} onEachFeature={onEachLGA}
          ref={(ref) => { lgaLayerRef.current = ref ?? null }} />
      )}
      {data.states && (
        <GeoJSON data={data.states} style={stateStyle} interactive={false}
          ref={(ref) => { stateLayerRef.current = ref ?? null }} />
      )}
      {data.districts && (
        <GeoJSON data={data.districts} style={districtStyle} interactive={false}
          ref={(ref) => { districtLayerRef.current = ref ?? null }} />
      )}
      {data.zones && (
        <GeoJSON data={data.zones} style={zoneStyle} interactive={false}
          ref={(ref) => { zoneLayerRef.current = ref ?? null }} />
      )}
      <MapController searchQuery={searchQuery} data={data} isDragging={isDragging} onZoomChange={onZoomChange} />
    </MapContainer>
  )
}
