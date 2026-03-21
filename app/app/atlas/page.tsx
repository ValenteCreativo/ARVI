'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Leaflet must be loaded client-side only
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center bg-[#060a07]">
    <div className="text-[#01f094]/40 text-xs font-mono animate-pulse">Loading ARVI Atlas...</div>
  </div>
)})

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

export default function AtlasPage() {
  const [weatherData, setWeatherData] = useState<WeatherNode[]>([])
  const [fires, setFires] = useState<FireHotspot[]>([])
  const [fetchedAt, setFetchedAt] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.json())
      .then(data => {
        setWeatherData(data.nodes || [])
        setFires(data.fires || [])
        setFetchedAt(data.fetched_at || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="h-screen bg-[#060a07] text-white flex flex-col overflow-hidden">

      {/* NAV */}
      <nav className="shrink-0 border-b border-white/5 bg-[#060a07]/95 backdrop-blur-md z-50">
        <div className="max-w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors">← Back</Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-xs">🗺️</span>
              <span className="font-bold text-sm">ARVI Atlas</span>
              <span className="text-xs text-white/20 font-mono">· CDMX Urban Forest Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/25">
            {loading ? (
              <span className="animate-pulse">Fetching live data...</span>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#01f094]" />
                  {weatherData.length} nodes live
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {fires.length} fire hotspots (NASA FIRMS)
                </span>
              </>
            )}
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-[#01f094]/10 border border-[#01f094]/25 text-[#01f094] hover:bg-[#01f094]/20 transition-all">
              Run Agent →
            </Link>
          </div>
        </div>
      </nav>

      {/* MAP — fills remaining height */}
      <div className="flex-1 relative">
        <MapComponent
          weatherNodes={weatherData}
          fires={fires}
        />

        {/* Floating legend */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-[#060a07]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 text-xs space-y-2">
          <div className="text-white/40 font-mono mb-3 uppercase tracking-widest text-[10px]">Intelligence Overlay</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /><span className="text-white/50">Critical threat — plague/dehydration</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="text-white/50">Monitoring — elevated risk</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#01f094]" /><span className="text-white/50">Healthy node</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 opacity-70" /><span className="text-white/50">NASA FIRMS fire hotspot</span></div>
        </div>

        {/* Fetched at */}
        {fetchedAt && (
          <div className="absolute bottom-6 right-6 z-[1000] text-[10px] font-mono text-white/15">
            Live · {new Date(fetchedAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
