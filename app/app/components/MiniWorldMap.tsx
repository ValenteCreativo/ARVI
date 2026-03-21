'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  className?: string
}

export default function MiniWorldMap({ className = '' }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(mapRef.current!, {
        center: [20, -60],
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

      // CDMX nodes with pulse markers
      const nodes = [
        { lat: 19.4133, lon: -99.1905, color: '#FF5C3A', name: 'Chapultepec — CRITICAL' },
        { lat: 19.4360, lon: -99.1508, color: '#FFC64D', name: 'Alameda — MONITORING' },
        { lat: 19.4528, lon: -99.1388, color: '#FFC64D', name: 'Tlatelolco — MONITORING' },
      ]

      nodes.forEach(node => {
        const html = `
          <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;width:20px;height:20px;border-radius:50%;border:1.5px solid ${node.color}60;background:${node.color}10;animation:pulse 2s infinite;"></div>
            <div style="width:7px;height:7px;border-radius:50%;background:${node.color};box-shadow:0 0 8px ${node.color};position:relative;z-index:1;"></div>
          </div>
        `
        const icon = L.divIcon({ html, className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
        L.marker([node.lat, node.lon], { icon }).addTo(map)
          .bindPopup(`<div style="background:#0A0B14;color:#F0EDE8;border:1px solid #ffffff15;border-radius:8px;padding:8px;font-family:monospace;font-size:11px;min-width:160px;">${node.name}</div>`, { className: 'arvi-popup' })
      })

      // Add CSS for pulse + popup
      if (!document.getElementById('mini-map-style')) {
        const style = document.createElement('style')
        style.id = 'mini-map-style'
        style.textContent = `
          @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
          .arvi-popup .leaflet-popup-content-wrapper { background:transparent!important; box-shadow:0 8px 32px rgba(0,0,0,0.8)!important; padding:0!important; border-radius:8px!important; }
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
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 cursor-crosshair ${className}`}
      style={{ transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.8)' : 'scale(1)', zIndex: hovered ? 20 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%', background: '#0A0B14' }} />
      {!hovered && (
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="font-mono text-[9px] text-white/25">hover to zoom</span>
        </div>
      )}
    </div>
  )
}
