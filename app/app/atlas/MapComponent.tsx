'use client'

import { useEffect, useRef } from 'react'
import { ARVI_NODES } from '@/data/nodes'

interface WeatherNode {
  node_id: string
  name: string
  lat: number
  lon: number
  weather: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    uv_index: number
    precipitation: number
  } | null
}

interface FireHotspot {
  lat: number
  lon: number
  brightness: number
  confidence: string
}

interface Props {
  weatherNodes: WeatherNode[]
  fires: FireHotspot[]
}

const NODE_COORDS: Record<string, { lat: number; lon: number }> = {
  'node-01': { lat: 19.4133, lon: -99.1905 },
  'node-02': { lat: 19.4360, lon: -99.1508 },
  'node-03': { lat: 19.4528, lon: -99.1388 },
}

export default function MapComponent({ weatherNodes, fires }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic Leaflet import
    import('leaflet').then(L => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [19.4326, -99.1332],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      })

      mapInstanceRef.current = map

      // Light OSM tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
      }).addTo(map)

      // Attribution small
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map)

      // Custom zoom control
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Add ARVI node markers
      ARVI_NODES.forEach(node => {
        const coords = NODE_COORDS[node.node_id]
        if (!coords) return

        const weatherNode = weatherNodes.find(w => w.node_id === node.node_id)
        const weather = weatherNode?.weather

        // Color based on health
        let color = '#01f094'
        let pulseClass = ''
        if (node.health_score < 0.4) { color = '#ef4444'; pulseClass = 'animate-pulse' }
        else if (node.health_score < 0.7) { color = '#eab308' }

        const markerHtml = `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="
              position:absolute;
              width:40px;height:40px;
              border-radius:50%;
              background:${color}20;
              border:1.5px solid ${color}60;
              animation: ${node.anomaly_detected ? 'pulse 1.5s infinite' : 'none'};
            "></div>
            <div style="
              width:14px;height:14px;
              border-radius:50%;
              background:${color};
              box-shadow:0 0 12px ${color}80;
              position:relative;z-index:1;
            "></div>
          </div>
        `

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })

        const tempStr = weather ? `${weather.temperature_2m.toFixed(1)}°C` : `${node.temperature_c}°C`
        const humStr = weather ? `${weather.relative_humidity_2m}%` : `${node.humidity_pct}%`
        const uvStr = weather ? `UV ${weather.uv_index.toFixed(1)}` : ''

        const statusBadge = node.anomaly_detected
          ? `<span style="background:#ef444420;border:1px solid #ef4444;color:#ef4444;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">⚠ ${(node.anomaly_type || '').replace(/_/g,' ').toUpperCase()}</span>`
          : node.health_score < 0.7
          ? `<span style="background:#eab30820;border:1px solid #eab308;color:#eab308;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">MONITORING</span>`
          : `<span style="background:#01f09420;border:1px solid #01f094;color:#01f094;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;">HEALTHY</span>`

        const popupContent = `
          <div style="background:#0a110c;border:1px solid #ffffff15;border-radius:12px;padding:14px;min-width:220px;font-family:monospace;">
            <div style="color:#ffffff40;font-size:10px;margin-bottom:4px;">${node.ens}</div>
            <div style="color:#ffffff;font-size:14px;font-weight:700;margin-bottom:8px;">${node.location}</div>
            <div style="margin-bottom:10px;">${statusBadge}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
              <div style="background:#ffffff08;border-radius:8px;padding:8px;">
                <div style="color:#ffffff30;font-size:9px;margin-bottom:2px;">HEALTH SCORE</div>
                <div style="color:${color};font-size:18px;font-weight:900;">${(node.health_score * 100).toFixed(0)}%</div>
              </div>
              <div style="background:#ffffff08;border-radius:8px;padding:8px;">
                <div style="color:#ffffff30;font-size:9px;margin-bottom:2px;">TREES</div>
                <div style="color:#ffffff80;font-size:18px;font-weight:900;">${node.trees_monitored}</div>
              </div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
              <span style="background:#ffffff08;padding:4px 8px;border-radius:6px;color:#ffffff50;font-size:11px;">🌡 ${tempStr}</span>
              <span style="background:#ffffff08;padding:4px 8px;border-radius:6px;color:#ffffff50;font-size:11px;">💧 ${humStr}</span>
              ${uvStr ? `<span style="background:#ffffff08;padding:4px 8px;border-radius:6px;color:#ffffff50;font-size:11px;">☀️ ${uvStr}</span>` : ''}
            </div>
            <div style="color:#ffffff20;font-size:9px;margin-top:6px;">Species: ${node.dominant_species} · CO₂: ${node.co2_ppm}ppm</div>
            ${weather ? '<div style="color:#01f09440;font-size:9px;margin-top:2px;">⚡ Live weather via Open-Meteo</div>' : ''}
          </div>
        `

        L.marker([coords.lat, coords.lon], { icon })
          .addTo(map)
          .bindPopup(popupContent, {
            maxWidth: 280,
            className: 'arvi-popup',
          })
      })

      // NASA FIRMS fire hotspots
      fires.slice(0, 30).forEach(fire => {
        const intensity = Math.min((fire.brightness - 300) / 100, 1)
        const fireHtml = `
          <div style="
            width:${8 + intensity * 8}px;
            height:${8 + intensity * 8}px;
            border-radius:50%;
            background:radial-gradient(circle, #ff6b0080 0%, #ff6b0020 100%);
            border:1px solid #ff6b0060;
          "></div>
        `
        const fireIcon = L.divIcon({
          html: fireHtml,
          className: '',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        L.marker([fire.lat, fire.lon], { icon: fireIcon })
          .addTo(map)
          .bindPopup(`
            <div style="background:#0a110c;border:1px solid #ff6b0030;border-radius:8px;padding:10px;font-family:monospace;">
              <div style="color:#ff6b00;font-weight:700;font-size:12px;">🔥 NASA FIRMS Fire Hotspot</div>
              <div style="color:#ffffff50;font-size:10px;margin-top:4px;">Brightness: ${fire.brightness.toFixed(0)}K</div>
              <div style="color:#ffffff30;font-size:10px;">Confidence: ${fire.confidence}</div>
            </div>
          `, { className: 'arvi-popup' })
      })

      // Custom CSS for popups
      const style = document.createElement('style')
      style.textContent = `
        .arvi-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.8) !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .arvi-popup .leaflet-popup-content { margin: 0 !important; }
        .arvi-popup .leaflet-popup-tip { background: #0a110c !important; }
        .leaflet-container { background: #060a07 !important; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `
      document.head.appendChild(style)
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render if weather data arrives after initial load
  useEffect(() => {
    // Weather data is baked into popup on mount — acceptable for hackathon
  }, [weatherNodes, fires])

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ background: '#060a07' }}
    />
  )
}
