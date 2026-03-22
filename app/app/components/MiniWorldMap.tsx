'use client'

import { useEffect, useRef } from 'react'

interface Props {
  className?: string
}

export default function MiniWorldMap({ className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(mapRef.current!, {
        center: [20, -20],
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
      })

      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 6,
      }).addTo(map)

      // CDMX active nodes
      const activeNodes = [
        { lat: 19.4133, lon: -99.1905, color: '#C0392B', name: 'Chapultepec — CRITICAL' },
        { lat: 19.4360, lon: -99.1508, color: '#B85C00', name: 'Alameda — MONITORING' },
        { lat: 19.4528, lon: -99.1388, color: '#B85C00', name: 'Tlatelolco — MONITORING' },
      ]

      // Future expansion ghost nodes
      const ghostNodes = [
        { lat: -23.5505, lon: -46.6333, name: 'São Paulo — Coming Soon' },
        { lat: 6.5244,   lon: 3.3792,   name: 'Lagos — Coming Soon' },
        { lat: 19.0760,  lon: 72.8777,  name: 'Mumbai — Coming Soon' },
        { lat: 52.5200,  lon: 13.4050,  name: 'Berlin — Coming Soon' },
        { lat: 35.6762,  lon: 139.6503, name: 'Tokyo — Coming Soon' },
        { lat: 40.7128,  lon: -74.0060, name: 'New York — Coming Soon' },
        { lat: -33.8688, lon: 151.2093, name: 'Sydney — Coming Soon' },
      ]

      activeNodes.forEach(node => {
        const html = `
          <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:28px;height:28px;border-radius:50%;border:1px solid ${node.color}40;background:${node.color}10;animation:arvi-pulse 2s infinite;"></div>
            <div style="position:absolute;width:16px;height:16px;border-radius:50%;border:1px solid ${node.color}60;background:${node.color}20;animation:arvi-pulse 2s infinite 0.3s;"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:${node.color};box-shadow:0 0 12px ${node.color}80;position:relative;z-index:1;"></div>
          </div>
        `
        const icon = L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] })
        L.marker([node.lat, node.lon], { icon }).addTo(map)
          .bindPopup(`<div style="background:#0A0B14;color:#F0EDE8;border:1px solid #ffffff15;border-radius:8px;padding:8px 12px;font-family:'DM Mono',monospace;font-size:11px;">${node.name}</div>`,
            { className: 'arvi-popup' })
      })

      ghostNodes.forEach(node => {
        const html = `
          <div style="width:8px;height:8px;border-radius:50%;border:1px solid rgba(46,125,107,0.35);background:rgba(46,125,107,0.08);box-shadow:0 0 6px rgba(46,125,107,0.2);"></div>
        `
        const icon = L.divIcon({ html, className: '', iconSize: [8, 8], iconAnchor: [4, 4] })
        L.marker([node.lat, node.lon], { icon }).addTo(map)
      })

      // Network lines: CDMX internal mesh
      const cdmxCoords: [number, number][] = activeNodes.map(n => [n.lat, n.lon])
      L.polyline(cdmxCoords, {
        color: '#2E7D6B', weight: 1.5, opacity: 0.8, dashArray: '4 8'
      }).addTo(map)

      // Global network lines: CDMX → ghost nodes
      const hub: [number, number] = [19.43, -99.17]
      ghostNodes.forEach(node => {
        L.polyline([hub, [node.lat, node.lon]], {
          color: '#2E7D6B', weight: 0.5, opacity: 0.2, dashArray: '2 12'
        }).addTo(map)
      })

      // CSS
      if (!document.getElementById('mini-map-style')) {
        const style = document.createElement('style')
        style.id = 'mini-map-style'
        style.textContent = `
          @keyframes arvi-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.6)} }
          .arvi-popup .leaflet-popup-content-wrapper { background:transparent!important;box-shadow:0 8px 32px rgba(0,0,0,0.8)!important;padding:0!important;border-radius:8px!important; }
          .arvi-popup .leaflet-popup-content { margin:0!important; }
          .arvi-popup .leaflet-popup-tip { background:#0A0B14!important; }
        `
        document.head.appendChild(style)
      }
    })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapInstanceRef.current) { (mapInstanceRef.current as any).remove(); mapInstanceRef.current = null }
    }
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ zIndex: 1 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0A0B14' }} />
    </div>
  )
}
