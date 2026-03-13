'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet'
import {
  type ChoroMode, type EthSubMode, type LGAProperties,
  getLGAStyle, getTooltipStat, ZONE_GLOW,
} from '@/lib/utils/choropleth'

// --- Types ---

interface NigeriaMapProps {
  choroMode: ChoroMode
  ethSubMode: EthSubMode
  onSelectLGA: (properties: LGAProperties | null) => void
  selectedLGA: string | null
  searchQuery: string
  focusedEthGroup?: string | null
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

// --- MapController: fly-to-search + zoom-dependent overlays ---

function MapController({ searchQuery, data, isDragging }: {
  searchQuery: string; data: GeoData; isDragging: React.MutableRefObject<boolean>
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

    map.on('zoomend', updateOverlays)
    updateOverlays()

    // Track drag state so LGA handlers can suppress during drag
    const onDragStart = () => { isDragging.current = true }
    const onDragEnd = () => { setTimeout(() => { isDragging.current = false }, 50) }
    map.on('dragstart', onDragStart)
    map.on('dragend', onDragEnd)

    return () => {
      map.off('zoomend', updateOverlays)
      map.off('dragstart', onDragStart)
      map.off('dragend', onDragEnd)
      zoneGroup.remove(); capitalGroup.remove()
    }
  }, [map, data.zoneCenters, data.capitals, isDragging])

  return null
}

// --- NigeriaMap ---

export default function NigeriaMap({
  choroMode, ethSubMode, onSelectLGA, selectedLGA, searchQuery, focusedEthGroup,
}: NigeriaMapProps) {
  const [data, setData] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const lgaLayerRef = useRef<L.GeoJSON | null>(null)
  const selectedRef = useRef<L.Layer | null>(null)
  const isDragging = useRef(false)

  useEffect(() => { fetchGeoData().then((d) => { setData(d); setLoading(false) }) }, [])

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

  // Highlight selected LGA
  useEffect(() => {
    const layer = lgaLayerRef.current
    if (!layer) return
    if (selectedRef.current) {
      const prev = selectedRef.current as L.Layer & { feature?: GeoJSON.Feature }
      if (prev.feature) {
        ;(selectedRef.current as L.Path).setStyle(
          getLGAStyle(prev.feature.properties as LGAProperties, choroMode, ethSubMode, focusedEthGroup)
        )
      }
      selectedRef.current = null
    }
    if (!selectedLGA) return
    layer.eachLayer((l) => {
      const feat = l as L.Layer & { feature?: GeoJSON.Feature }
      if (feat.feature && (feat.feature.properties as LGAProperties).n === selectedLGA) {
        ;(l as L.Path).setStyle({ weight: 3, color: '#2C1810', fillOpacity: 0.8 })
        selectedRef.current = l
      }
    })
  }, [selectedLGA, choroMode, ethSubMode, focusedEthGroup])

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
          path.setStyle({ weight: 3, color: '#2A8B9A', fillOpacity: 0.75 })
          path.bringToFront()
          path.bindTooltip(`<b>${p.n}</b><br/>${getTooltipStat(p, choroMode, ethSubMode)}`, {
            sticky: true, className: 'lga-tooltip',
          })
          path.openTooltip()
        },
        mouseout: () => {
          if (selectedLGA !== p.n) path.setStyle(getLGAStyle(p, choroMode, ethSubMode, focusedEthGroup))
          path.unbindTooltip()
        },
        click: () => {
          if (isDragging.current) return
          onSelectLGA(p)
        },
      })
    },
    [choroMode, ethSubMode, selectedLGA, onSelectLGA, focusedEthGroup]
  )

  const lgaKey = `lga-${choroMode}-${ethSubMode}-${selectedLGA}-${focusedEthGroup}`

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
      {data.districts && <GeoJSON data={data.districts} style={districtStyle} interactive={false} />}
      {data.zones && <GeoJSON data={data.zones} style={zoneStyle} interactive={false} />}
      <MapController searchQuery={searchQuery} data={data} isDragging={isDragging} />
    </MapContainer>
  )
}
