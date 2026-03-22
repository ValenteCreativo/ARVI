'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ARVI_NODES, type NodeData } from '@/data/nodes'
import dynamic from 'next/dynamic'

const MapComponent = dynamic(() => import('../atlas/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-muted font-mono text-sm">Loading Atlas…</div>,
})

type Tab = 'sensors' | 'intelligence' | 'actions' | 'global' | 'atlas'
type PipelineStage = 'idle' | 'sense' | 'analyze' | 'act' | 'pay' | 'done'
const STAGE_IDX: Record<PipelineStage, number> = { idle: 0, sense: 1, analyze: 2, act: 3, pay: 4, done: 5 }

function healthColor(s: number) { return s < 0.4 ? '#C0392B' : s < 0.7 ? '#B85C00' : '#2E7D6B' }
function healthLabel(s: number) { return s < 0.4 ? 'CRITICAL' : s < 0.7 ? 'WARNING' : 'NOMINAL' }
function aqiLabel(v: number) { return v < 50 ? 'Good' : v < 100 ? 'Moderate' : v < 150 ? 'Unhealthy*' : 'Unhealthy' }

interface LogEntry { ts: string; type: string; msg: string; color: string }

interface WeatherData {
  temperature_2m?: number
  relative_humidity_2m?: number
  wind_speed_10m?: number
  uv_index?: number
  precipitation?: number
}

interface WeatherNode {
  node_id: string
  name: string
  lat: number
  lon: number
  weather: WeatherData | null
}

interface FireHotspot {
  lat: number
  lon: number
  brightness: number
  confidence: string
}

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="h-1 flex-1 bg-line rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full" initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.7 }}
        style={{ background: color }} />
    </div>
  )
}

function SignalDot({ color = '#2E7D6B', pulse = true }: { color?: string; pulse?: boolean }) {
  return (
    <span className="relative flex w-2 h-2 shrink-0">
      {pulse && <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50" style={{ background: color }} />}
      <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: color }} />
    </span>
  )
}

// ─── Global Intelligence Tab ──────────────────────────────────────────────────
function GlobalTab() {
  const [weatherNodes, setWeatherNodes] = useState<WeatherNode[]>([])
  const [fires, setFires] = useState<FireHotspot[]>([])
  const [fetchedAt, setFetchedAt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.json())
      .then(data => {
        setWeatherNodes(data.nodes || [])
        setFires(data.fires || [])
        setFetchedAt(data.fetched_at || new Date().toISOString())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const fireHigh = fires.filter(f => f.confidence === 'high' || f.confidence === 'h').length
  const fireMed = fires.filter(f => f.confidence === 'nominal' || f.confidence === 'n').length
  const avgTemp = weatherNodes.length > 0
    ? (weatherNodes.reduce((a, n) => a + (n.weather?.temperature_2m ?? 0), 0) / weatherNodes.length).toFixed(1)
    : '--'
  const avgHumidity = weatherNodes.length > 0
    ? Math.round(weatherNodes.reduce((a, n) => a + (n.weather?.relative_humidity_2m ?? 0), 0) / weatherNodes.length)
    : '--'
  const maxUV = weatherNodes.length > 0
    ? Math.max(...weatherNodes.map(n => n.weather?.uv_index ?? 0)).toFixed(1)
    : '--'

  return (
    <div className="space-y-4">
      {/* Global stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Fire Hotspots', val: loading ? '...' : String(fires.length), sub: 'Mexico · NASA FIRMS · 24h', color: fires.length > 20 ? '#C0392B' : fires.length > 5 ? '#B85C00' : '#2E7D6B', icon: '▸' },
          { label: 'High Confidence', val: loading ? '...' : String(fireHigh), sub: 'Fire hotspots confirmed', color: fireHigh > 10 ? '#C0392B' : '#B85C00', icon: '○' },
          { label: 'Avg Temperature', val: loading ? '...' : `${avgTemp}°C`, sub: 'Network mean · Open-Meteo', color: '#888', icon: '◈' },
          { label: 'Max UV Index', val: loading ? '...' : String(maxUV), sub: 'Across all nodes today', color: Number(maxUV) > 8 ? '#B85C00' : '#2E7D6B', icon: '⬡' },
        ].map(item => (
          <div key={item.label} className="panel p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest leading-tight">{item.label}</p>
              <span className="font-mono text-[10px]" style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div className="font-serif text-3xl mb-1" style={{ color: item.color }}>{item.val}</div>
            <p className="font-mono text-[9px] text-muted/60">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* NASA FIRMS data */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SignalDot color="#B85C00" pulse={fires.length > 10} />
            <span>NASA FIRMS — Active Fire Intelligence</span>
          </div>
          <span className="font-mono text-[9px] text-muted/50 normal-case tracking-normal">
            {loading ? 'fetching...' : `${fires.length} hotspots detected · 24h window`}
          </span>
        </div>
        <div className="p-5">
          {loading ? (
            <p className="font-mono text-[10px] text-muted animate-pulse">Contacting NASA FIRMS API...</p>
          ) : fires.length > 0 ? (
            <div className="space-y-3">
              {/* Fire breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'High confidence', val: fireHigh, color: '#C0392B' },
                  { label: 'Nominal confidence', val: fireMed, color: '#B85C00' },
                  { label: 'Low confidence', val: fires.length - fireHigh - fireMed, color: '#888' },
                ].map(b => (
                  <div key={b.label} className="rounded-lg bg-canvas border border-line p-3 text-center">
                    <div className="font-serif text-2xl mb-1" style={{ color: b.color }}>{b.val}</div>
                    <p className="font-mono text-[9px] text-muted">{b.label}</p>
                  </div>
                ))}
              </div>
              {/* Top hotspots */}
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-2">Top hotspots by brightness</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {fires
                  .sort((a, b) => b.brightness - a.brightness)
                  .slice(0, 8)
                  .map((f, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-muted">[{f.lat.toFixed(3)}, {f.lon.toFixed(3)}]</span>
                      <div className="flex items-center gap-3">
                        <span className="text-ink/60">{f.brightness.toFixed(0)} K</span>
                        <span className="px-1.5 py-0.5 rounded text-[8px]"
                          style={{
                            color: f.confidence === 'high' || f.confidence === 'h' ? '#C0392B' : '#B85C00',
                            background: f.confidence === 'high' || f.confidence === 'h' ? '#C0392B15' : '#B85C0015',
                          }}>
                          {f.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="font-mono text-[10px] text-jade">No active fire hotspots detected in this window.</p>
          )}
        </div>
      </div>

      {/* Open-Meteo weather per node */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SignalDot color="#2E7D6B" />
            <span>Open-Meteo — Live Weather per Node</span>
          </div>
          <span className="font-mono text-[9px] text-muted/50 normal-case tracking-normal">
            {fetchedAt ? new Date(fetchedAt).toLocaleTimeString() : 'live'} UTC
          </span>
        </div>
        <div className="p-5">
          {loading ? (
            <p className="font-mono text-[10px] text-muted animate-pulse">Fetching Open-Meteo...</p>
          ) : (
            <div className="space-y-4">
              {weatherNodes.map(node => {
                const w = node.weather
                const arviNode = ARVI_NODES.find(n => n.node_id === node.node_id)
                const nc = arviNode ? healthColor(arviNode.health_score) : '#888'
                return (
                  <div key={node.node_id} className="rounded-xl border border-line bg-canvas p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-mono text-[10px] text-ink font-medium">{node.name || node.node_id}</p>
                        <p className="font-mono text-[9px] text-muted">[{node.lat}, {node.lon}]</p>
                      </div>
                      {arviNode && (
                        <span className="font-mono text-[8px] px-2 py-0.5 rounded-full border"
                          style={{ color: nc, borderColor: `${nc}30`, background: `${nc}10` }}>
                          {healthLabel(arviNode.health_score)}
                        </span>
                      )}
                    </div>
                    {w ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[
                          { l: 'Temp', v: `${w.temperature_2m?.toFixed(1)}°C`, c: (w.temperature_2m ?? 0) > 30 ? '#B85C00' : '#111' },
                          { l: 'Humidity', v: `${w.relative_humidity_2m}%`, c: '#111' },
                          { l: 'Wind', v: `${w.wind_speed_10m} km/h`, c: '#111' },
                          { l: 'UV', v: String(w.uv_index?.toFixed(1)), c: (w.uv_index ?? 0) > 8 ? '#B85C00' : '#111' },
                          { l: 'Precip', v: `${w.precipitation ?? 0} mm`, c: '#111' },
                        ].map(row => (
                          <div key={row.l} className="rounded bg-white border border-line p-2 text-center">
                            <p className="font-mono text-[8px] text-muted mb-1">{row.l}</p>
                            <p className="font-mono text-[10px] font-medium" style={{ color: row.c }}>{row.v}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-[9px] text-muted">Weather data unavailable</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Composite risk */}
      <div className="panel overflow-hidden">
        <div className="panel-header">Composite Environmental Risk — CDMX Network</div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {ARVI_NODES.map(node => {
            const nc = healthColor(node.health_score)
            return (
              <div key={node.node_id} className="rounded-xl border p-4 text-center"
                style={{ borderColor: `${nc}30`, background: `${nc}06` }}>
                <p className="font-mono text-[9px] text-muted mb-1">{node.location.split(',')[0]}</p>
                <div className="font-serif text-2xl mb-1" style={{ color: nc }}>
                  {((1 - node.health_score) * 100).toFixed(0)}%
                </div>
                <p className="font-mono text-[8px]" style={{ color: nc }}>risk index</p>
                <div className="mt-2 h-1 rounded-full bg-line overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: nc }}
                    initial={{ width: 0 }} animate={{ width: `${(1 - node.health_score) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} />
                </div>
              </div>
            )
          })}
          <div className="rounded-xl border border-[#DADADA] p-4 text-center">
            <p className="font-mono text-[9px] text-muted mb-1">Network Average</p>
            <div className="font-serif text-2xl mb-1 text-ink">
              {((1 - ARVI_NODES.reduce((a, n) => a + n.health_score, 0) / ARVI_NODES.length) * 100).toFixed(0)}%
            </div>
            <p className="font-mono text-[8px] text-muted">composite risk</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sensor Tab ────────────────────────────────────────────────────────────────
function SensorTab({ node }: { node: NodeData }) {
  const hc = healthColor(node.health_score)
  const groups = [
    {
      title: 'Microclimate — canopy level',
      note: 'Not city averages. Tree-specific, 2m above ground.',
      rows: [
        { l: 'Temperature',  v: `${node.temperature_c}°C`,   n: 'canopy',     c: node.temperature_c > 30 ? '#C0392B' : '#111',      bar: node.temperature_c,      max: 45 },
        { l: 'Humidity',     v: `${node.humidity_pct}%`,     n: 'root zone',  c: node.humidity_pct < 35 ? '#B85C00' : '#111',       bar: node.humidity_pct,       max: 100 },
        { l: 'CO₂',          v: `${node.co2_ppm} ppm`,       n: 'air column', c: '#111',                                             bar: node.co2_ppm - 350,      max: 200 },
        { l: 'UV Index',     v: `${node.uv_index}`,          n: 'base',       c: node.uv_index > 8 ? '#B85C00' : '#111',            bar: node.uv_index,           max: 12 },
      ],
    },
    {
      title: 'Soil & Water',
      note: 'Root zone sensors at 30–60cm depth.',
      rows: [
        { l: 'Soil Moisture', v: `${node.soil_moisture_pct}%`, n: 'root zone', c: node.soil_moisture_pct < 25 ? '#C0392B' : '#111', bar: node.soil_moisture_pct, max: 100 },
      ],
    },
    {
      title: 'Air Quality',
      note: `AQI at canopy — ${aqiLabel(node.air_quality_index)}`,
      rows: [
        { l: 'AQI (PM2.5/PM10)', v: String(node.air_quality_index), n: 'canopy specific', c: node.air_quality_index > 100 ? '#C0392B' : node.air_quality_index > 50 ? '#B85C00' : '#2E7D6B', bar: node.air_quality_index, max: 300 },
      ],
    },
    {
      title: 'Ecosystem Intelligence',
      note: 'Audio sensor + AI model + visual sensor.',
      rows: [
        { l: 'Biodiversity Score', v: `${(node.biodiversity_score*100).toFixed(0)}%`, n: 'audio sensor',  c: node.biodiversity_score < 0.4 ? '#C0392B' : '#111',                bar: node.biodiversity_score*100, max: 100 },
        { l: 'Pathogen Risk',      v: `${(node.pathogen_risk*100).toFixed(0)}%`,      n: 'AI model',      c: node.pathogen_risk > 0.6 ? '#C0392B' : node.pathogen_risk > 0.3 ? '#B85C00' : '#2E7D6B', bar: node.pathogen_risk*100, max: 100 },
        { l: 'Canopy Density',     v: `${node.canopy_density_pct}%`,                  n: 'visual sensor', c: node.canopy_density_pct < 50 ? '#B85C00' : '#111',                bar: node.canopy_density_pct,     max: 100 },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">What this node measures</p>
            <p className="text-sm text-ink/60">Signals that city-scale APIs cannot provide.</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-[9px] text-muted mb-1">Overall Health</div>
            <div className="font-serif text-3xl" style={{ color: hc }}>{(node.health_score * 100).toFixed(0)}%</div>
            <div className="font-mono text-[9px] mt-1" style={{ color: hc }}>{healthLabel(node.health_score)}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Species', val: node.dominant_species.split('(')[0].trim() },
            { label: 'Trees',   val: `${node.trees_monitored} monitored` },
            { label: 'Chain',   val: node.ens },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-canvas border border-line p-3">
              <p className="font-mono text-[9px] text-muted uppercase mb-1">{item.label}</p>
              <p className="font-mono text-[10px] text-ink truncate">{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      {groups.map(g => (
        <div key={g.title} className="panel overflow-hidden">
          <div className="panel-header flex items-center justify-between">
            <span>{g.title}</span>
            <span className="font-mono text-[9px] text-muted/60 normal-case tracking-normal">{g.note}</span>
          </div>
          <div className="p-5 space-y-4">
            {g.rows.map(row => (
              <div key={row.l}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-ink/60">{row.l}</span>
                    <span className="font-mono text-[9px] text-muted/50">{row.n}</span>
                  </div>
                  <span className="font-mono text-sm font-medium" style={{ color: row.c }}>{row.v}</span>
                </div>
                <Bar value={row.bar} max={row.max} color={row.c} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Intelligence Tab ──────────────────────────────────────────────────────────
function IntelligenceTab({ node, result, onRun, loading }: {
  node: NodeData; result: Record<string, unknown> | undefined; onRun: () => void; loading: boolean
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [fires, setFires] = useState(0)
  const [fireHigh, setFireHigh] = useState(0)

  useEffect(() => {
    fetch('/api/weather').then(r => r.json()).then(data => {
      const nw = data.nodes?.find((n: { node_id: string }) => n.node_id === node.node_id)
      if (nw?.weather) setWeather(nw.weather)
      const allFires: FireHotspot[] = data.fires || []
      setFires(allFires.length)
      setFireHigh(allFires.filter(f => f.confidence === 'high' || f.confidence === 'h').length)
    }).catch(() => {})
  }, [node.node_id])

  const analysis = result?.analysis as Record<string, unknown> | undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Open-Meteo */}
        <div className="panel overflow-hidden">
          <div className="panel-header">
            Live Weather &nbsp;<span className="text-jade/60 normal-case tracking-normal font-normal">Open-Meteo API</span>
          </div>
          <div className="p-5">
            {weather ? (
              <div className="space-y-3">
                {[
                  { l: 'City temperature', v: `${weather.temperature_2m?.toFixed(1)}°C`, note: `vs canopy: ${node.temperature_c}°C` },
                  { l: 'City humidity',    v: `${weather.relative_humidity_2m}%`,          note: `vs root zone: ${node.humidity_pct}%` },
                  { l: 'Wind speed',       v: `${weather.wind_speed_10m} km/h` },
                  { l: 'UV (city avg)',    v: String(weather.uv_index?.toFixed(1)),         note: `vs node base: ${node.uv_index}` },
                  { l: 'Precipitation',   v: `${weather.precipitation ?? 0} mm` },
                ].map(row => (
                  <div key={row.l} className="flex items-start justify-between">
                    <span className="font-mono text-[10px] text-muted">{row.l}</span>
                    <div className="text-right">
                      <span className="font-mono text-[11px] text-ink">{row.v}</span>
                      {row.note && <p className="font-mono text-[9px] text-jade mt-0.5">{row.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="font-mono text-[10px] text-muted animate-pulse">Fetching Open-Meteo...</p>}
          </div>
        </div>

        {/* NASA FIRMS */}
        <div className="panel overflow-hidden">
          <div className="panel-header">
            Satellite Intelligence &nbsp;<span className="text-jade/60 normal-case tracking-normal font-normal">NASA FIRMS</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { l: 'Fire hotspots (Mexico, 24h)', v: String(fires),     c: fires > 20 ? '#C0392B' : fires > 5 ? '#B85C00' : '#2E7D6B' },
              { l: 'High confidence fires',        v: String(fireHigh),  c: fireHigh > 10 ? '#C0392B' : '#B85C00' },
              { l: 'Pathogen risk (this node)',    v: `${(node.pathogen_risk*100).toFixed(0)}%`, c: node.pathogen_risk > 0.6 ? '#C0392B' : '#B85C00' },
              { l: 'Biodiversity vs avg',          v: node.biodiversity_score < 0.5 ? `${(node.biodiversity_score*100).toFixed(0)}% ↓` : 'Within range', c: node.biodiversity_score < 0.5 ? '#C0392B' : '#2E7D6B' },
              { l: 'Composite risk index',         v: `${((1-node.health_score)*100).toFixed(0)}%`, c: healthColor(node.health_score) },
            ].map(row => (
              <div key={row.l} className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted">{row.l}</span>
                <span className="font-mono text-[11px] font-medium" style={{ color: row.c }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Analysis */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <span>Agent Pattern Analysis</span>
          {!analysis && (
            <button onClick={onRun} disabled={loading}
              className="font-mono text-[10px] text-jade hover:text-jade/70 transition-colors disabled:opacity-40">
              {loading ? 'analyzing...' : '▸ run analysis'}
            </button>
          )}
        </div>
        <div className="p-5">
          {analysis ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <SignalDot color={healthColor(node.health_score)} />
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  {String(analysis.severity)} — {String(analysis.alert_type).replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-[9px] text-muted/50 ml-auto">
                  {((analysis.confidence as number ?? 0) * 100).toFixed(0)}% confidence
                </span>
              </div>
              <p className="text-ink/70 text-sm leading-relaxed mb-4">{String(analysis.description)}</p>
              <div className="border-l-2 border-jade pl-4 mb-3">
                <p className="font-mono text-[10px] text-jade">{String(analysis.recommended_action)}</p>
              </div>
              {/* Job board suggestion */}
              <div className="rounded-xl border border-jade/30 bg-[#EAF4F1] p-4 mt-3">
                <p className="font-mono text-[9px] text-jade uppercase tracking-widest mb-1">▸ Job Board — Field Validation</p>
                <p className="font-mono text-[10px] text-ink/70">
                  Alert detected at [{node.lat ?? '19.41'}, {node.lon ?? '-99.19'}]. Task: in-situ inspection + SEDEMA report. Bounty: 12 USDC
                </p>
              </div>
              <p className="font-mono text-[9px] text-muted/40 mt-3">{String(analysis.model_used)}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-mono text-[10px] text-muted mb-4">Run the agent to see pattern analysis and field job recommendations.</p>
              <button onClick={onRun} disabled={loading} className="btn-jade disabled:opacity-40">
                {loading ? 'Analyzing...' : '▸ Run Agent Analysis'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trend grid */}
      <div className="panel overflow-hidden">
        <div className="panel-header">Trend Indicators</div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: 'Health',       v: node.health_score < 0.5 ? '↓ declining' : '→ stable',        c: node.health_score < 0.5 ? '#C0392B' : '#B85C00' },
            { l: 'Biodiversity', v: node.biodiversity_score < 0.5 ? '↓ shrinking' : '→ stable',   c: node.biodiversity_score < 0.5 ? '#C0392B' : '#2E7D6B' },
            { l: 'Soil',         v: node.soil_moisture_pct < 25 ? '↓ drying' : '→ adequate',      c: node.soil_moisture_pct < 25 ? '#B85C00' : '#2E7D6B' },
            { l: 'Pathogen',     v: node.pathogen_risk > 0.5 ? '↑ rising' : '→ low',              c: node.pathogen_risk > 0.5 ? '#C0392B' : '#2E7D6B' },
          ].map(t => (
            <div key={t.l} className="rounded-lg bg-canvas border border-line p-3 text-center">
              <p className="font-mono text-[9px] text-muted mb-1">{t.l}</p>
              <p className="font-mono text-xs font-medium" style={{ color: t.c }}>{t.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Actions Tab ───────────────────────────────────────────────────────────────
const PIPELINE = [
  { id: 'sense',   sym: '○', label: 'Sense',   sub: 'Data received' },
  { id: 'analyze', sym: '◈', label: 'Analyze', sub: 'LLM pattern' },
  { id: 'act',     sym: '▸', label: 'Act',     sub: 'Onchain log' },
  { id: 'pay',     sym: '—', label: 'Pay',     sub: 'USDC transfer' },
]

function ActionsTab({ stage, log, result, onRun, loading }: {
  stage: PipelineStage; log: LogEntry[]; result: Record<string, unknown> | undefined; onRun: () => void; loading: boolean
}) {
  const payment = result?.payment as Record<string, unknown> | undefined

  return (
    <div className="space-y-4">
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <span>Agent Pipeline</span>
          <button onClick={onRun} disabled={loading}
            className="font-mono text-[10px] text-jade hover:text-jade/70 transition-colors disabled:opacity-40">
            {loading ? '◈ running...' : '▸ run agent'}
          </button>
        </div>
        <div className="p-6 flex items-start gap-0">
          {PIPELINE.map((p, i) => {
            const isActive = STAGE_IDX[stage] === i + 1
            const isDone = STAGE_IDX[stage] > i + 1 || stage === 'done'
            return (
              <div key={p.id} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div animate={{ scale: isActive ? 1.1 : 1 }}
                    className="w-10 h-10 rounded-full border flex items-center justify-center font-mono text-sm mb-2 transition-all"
                    style={{
                      borderColor: isDone ? '#2E7D6B' : isActive ? '#2E7D6B' : '#DADADA',
                      background: isDone ? '#EAF4F1' : isActive ? '#EAF4F1' : 'white',
                      color: isDone || isActive ? '#2E7D6B' : '#888',
                      boxShadow: isActive ? '0 0 0 4px rgba(46,125,107,0.12)' : 'none',
                    }}>
                    {isDone ? '✓' : p.sym}
                  </motion.div>
                  <p className="font-mono text-[10px] text-center text-ink/60">{p.label}</p>
                  <p className="font-mono text-[9px] text-center text-muted">{p.sub}</p>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="h-px w-6 mt-5 mx-1 shrink-0 transition-colors"
                    style={{ background: STAGE_IDX[stage] > i + 1 || stage === 'done' ? '#2E7D6B40' : '#E5E5E5' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Job Board output */}
      {result && (
        <div className="panel overflow-hidden">
          <div className="panel-header flex items-center gap-2">
            <SignalDot color="#2E7D6B" />
            Autonomous Actions
          </div>
          <div className="p-5 space-y-3">
            {/* Payment */}
            {payment && (
              <div className="rounded-xl border border-jade/30 bg-[#EAF4F1] p-4">
                <p className="font-mono text-[9px] text-jade uppercase tracking-widest mb-2">— Operator Payment Executed</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><p className="font-mono text-[9px] text-muted mb-1">Amount</p><p className="font-serif text-xl text-jade">{String(payment.amount_usdc)} USDC</p></div>
                  <div><p className="font-mono text-[9px] text-muted mb-1">Recipient</p><p className="font-mono text-[10px] text-ink/60">{String(payment.recipient ?? '').slice(0, 16)}...</p></div>
                  <div><p className="font-mono text-[9px] text-muted mb-1">Chain</p><p className="font-mono text-[10px] text-ink/60">Base</p></div>
                  <div><p className="font-mono text-[9px] text-muted mb-1">Status</p><p className="font-mono text-[10px] text-jade">✓ Confirmed</p></div>
                </div>
              </div>
            )}
            {/* Job board */}
            <div className="rounded-xl border border-[#DADADA] bg-canvas p-4">
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-2">▸ Field Job Published — Bounty Board</p>
              <p className="font-mono text-[10px] text-ink/70 mb-2">
                Anomaly detected. Field validation required — inspect coordinates, collect evidence, file official report.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted">Bounty: 12 USDC · Status: OPEN</span>
                <span className="font-mono text-[9px] text-jade">Posted onchain ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <span>Execution Log</span>
          <a href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json"
            target="_blank" rel="noopener" className="font-mono text-[9px] text-muted/40 hover:text-jade transition-colors">
            agent_log.json ↗
          </a>
        </div>
        <div className="p-4 space-y-1.5 max-h-64 overflow-y-auto bg-canvas/50">
          <AnimatePresence>
            {log.map((entry, i) => (
              <motion.div key={`${entry.ts}-${i}`} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
                className="font-mono text-[10px] leading-relaxed">
                <span className="text-muted/50">[{entry.ts}]</span>
                {' '}<span className="font-medium" style={{ color: entry.color }}>{entry.type}</span>
                {' '}<span className="text-ink/50">{entry.msg}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNode, setActiveNode] = useState<NodeData>(ARVI_NODES[0])
  const [tab, setTab] = useState<Tab>('global')
  const [darkMode, setDarkMode] = useState(false)
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<PipelineStage>('idle')
  const [log, setLog] = useState<LogEntry[]>([
    { ts: '06:47:00', type: 'INIT',     msg: 'ARVI network online — ERC-8004 Base Mainnet',          color: '#2E7D6B' },
    { ts: '07:04:00', type: 'IDENTITY', msg: 'Agent Pantera registered — 0xb8623d...cf43a',          color: '#888' },
    { ts: '07:24:00', type: 'ANALYSIS', msg: 'Chapultepec plague detected — 94% confidence',         color: '#C0392B' },
    { ts: '07:24:01', type: 'PAYMENT',  msg: '8.5 USDC → 0x7099...79C8 via Locus',                   color: '#2E7D6B' },
    { ts: '07:24:02', type: 'JOB',      msg: 'Field bounty published — 12 USDC · OPEN',              color: '#2E7D6B' },
  ])
  const [now, setNow] = useState('')
  const [globalFires, setGlobalFires] = useState(0)
  const [globalTemp, setGlobalTemp] = useState<string>('--')

  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().replace('T', ' ').slice(0, 19))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  // Fetch global data for header
  useEffect(() => {
    fetch('/api/weather').then(r => r.json()).then(data => {
      setGlobalFires(data.fires?.length ?? 0)
      const avgT = data.nodes?.length > 0
        ? (data.nodes.reduce((a: number, n: WeatherNode) => a + (n.weather?.temperature_2m ?? 0), 0) / data.nodes.length).toFixed(1)
        : '--'
      setGlobalTemp(avgT)
    }).catch(() => {})
  }, [])

  const addLog = (type: string, msg: string, color: string) => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [{ ts, type, msg, color }, ...prev].slice(0, 30))
  }

  const runAgent = useCallback(async () => {
    if (loading) return
    setLoading(true); setStage('sense'); setTab('actions')
    addLog('SENSE', `${activeNode.node_id} — ${activeNode.location}`, '#2E7D6B')
    await new Promise(r => setTimeout(r, 700))
    setStage('analyze')
    addLog('ANALYZE', 'LLM analysis — Bankr/Gemini Gateway', '#888')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: activeNode.node_id })
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [activeNode.node_id]: data }))
      setStage('act')
      const a = data.analysis as Record<string, unknown>
      addLog('ACT', `${String(a?.severity).toUpperCase()} · ${String(a?.alert_type).replace(/_/g, ' ')} · ${((a?.confidence as number ?? 0)*100).toFixed(0)}% conf`, a?.severity === 'critical' ? '#C0392B' : '#B85C00')
      await new Promise(r => setTimeout(r, 500)); setStage('pay')
      const p = data.payment as Record<string, unknown>
      if (p) addLog('PAY', `${String(p.amount_usdc)} USDC → ${String(p.recipient ?? '').slice(0, 16)}...`, '#2E7D6B')
      await new Promise(r => setTimeout(r, 300))
      addLog('JOB', `Field bounty published — 12 USDC · coordinates logged onchain`, '#2E7D6B')
      setStage('done')
    } catch (e) { addLog('ERROR', String(e), '#C0392B') }
    finally { setLoading(false); setTimeout(() => setStage('idle'), 2000) }
  }, [loading, activeNode])

  const netHealth = ARVI_NODES.reduce((a, n) => a + n.health_score, 0) / ARVI_NODES.length
  const alertCount = ARVI_NODES.filter(n => n.anomaly_detected || n.health_score < 0.4).length
  const result = results[activeNode.node_id]

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? "bg-[#0A0B14] text-[#E8E8E8]" : "bg-canvas text-ink"}`}>
      {/* Header */}
      <header className={`shrink-0 border-b z-10 ${darkMode ? "bg-[#0F1020] border-white/10" : "border-line bg-white"}`}>
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-[11px] text-muted hover:text-ink transition-colors">← Back</Link>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-jade/30 bg-jade-light flex items-center justify-center font-mono text-jade text-[10px]">◈</div>
              <span className="font-mono text-sm text-ink">ARVI — Climate Intelligence</span>
            </div>
          </div>
          {/* Live global stats in header */}
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B85C00]" />
              <span className="font-mono text-[10px] text-muted">{globalFires} fire hotspots · NASA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#888]" />
              <span className="font-mono text-[10px] text-muted">{globalTemp}°C avg · Open-Meteo</span>
            </div>
            <div className="flex items-center gap-2">
              <SignalDot color={alertCount > 0 ? '#C0392B' : '#2E7D6B'} pulse={alertCount > 0} />
              <span className="font-mono text-[11px] text-muted">
                {alertCount > 0 ? `${alertCount} alert${alertCount > 1 ? 's' : ''}` : 'all nominal'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted/40">{now} UTC</span>
            <Link href="/atlas" className="font-mono text-[11px] text-muted hover:text-jade transition-colors">Atlas ○</Link>
            <button
              onClick={() => setDarkMode(d => !d)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-line text-muted hover:text-jade hover:border-jade transition-all ml-2"
              title="Toggle dark/light mode"
            >
              {darkMode ? '☀ Light' : '☾ Dark'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-56 shrink-0 border-r flex flex-col ${darkMode ? "bg-[#0F1020] border-white/10" : "border-line bg-white"}`}>
          <div className="px-4 py-3 border-b border-line">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[9px] text-muted uppercase tracking-widest">Network · CDMX</p>
              <span className="font-mono text-[9px] text-jade">{(netHealth * 100).toFixed(0)}%</span>
            </div>
            <Bar value={netHealth * 100} color={healthColor(netHealth)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {ARVI_NODES.map(node => {
              const nc = healthColor(node.health_score)
              const isActive = node.node_id === activeNode.node_id
              return (
                <button key={node.node_id} onClick={() => { setActiveNode(node); if (tab === 'global') setTab('sensors') }}
                  className={`w-full text-left px-4 py-4 border-b border-line transition-all ${isActive && tab !== 'global' ? 'bg-jade-light border-l-2' : 'hover:bg-canvas'}`}
                  style={isActive && tab !== 'global' ? { borderLeftColor: nc } : {}}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[9px] text-muted">{node.ens}</span>
                    <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full border"
                      style={{ color: nc, borderColor: `${nc}30`, background: `${nc}10` }}>
                      {healthLabel(node.health_score)}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-ink mb-2">{node.location.split(',')[0]}</p>
                  <div className="flex items-center gap-2">
                    <Bar value={node.health_score * 100} color={nc} />
                    <span className="font-mono text-[10px] shrink-0" style={{ color: nc }}>{(node.health_score * 100).toFixed(0)}%</span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="px-4 py-3 border-t border-line">
            <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
              target="_blank" rel="noopener"
              className="font-mono text-[9px] text-muted/40 hover:text-jade transition-colors block">
              ERC-8004 · Base Mainnet ↗
            </a>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs + run button */}
          <div className="border-b border-line bg-white px-6 pt-4 pb-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                {tab === 'global'
                  ? <h2 className="font-serif text-xl text-ink">Global Intelligence Feed</h2>
                  : (
                    <div>
                      <p className="font-mono text-[10px] text-muted mb-0.5">{activeNode.ens} · {activeNode.zone}</p>
                      <h2 className="font-serif text-xl text-ink">{activeNode.location}</h2>
                    </div>
                  )}
              </div>
              <button onClick={runAgent} disabled={loading || tab === 'global'}
                className="btn-jade disabled:opacity-40 flex items-center gap-2">
                {loading
                  ? <><span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />Running</>
                  : '▸ Run Agent'}
              </button>
            </div>
            <div className="flex items-center gap-1">
              {([
                ['global', '⬡ Global Feed'],
                ['sensors', '○ Sensors'],
                ['intelligence', '◈ Intelligence'],
                ['actions', '▸ Actions'],
                ['atlas', '○ Atlas'],
              ] as [Tab, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`font-mono text-[11px] px-4 py-2.5 border-b-2 transition-all ${tab === id ? 'text-jade border-jade' : 'text-muted border-transparent hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-canvas">
            <AnimatePresence mode="wait">
              <motion.div key={tab + activeNode.node_id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {tab === 'global'       && <GlobalTab />}
                {tab === 'sensors'      && <SensorTab node={activeNode} />}
                {tab === 'intelligence' && <IntelligenceTab node={activeNode} result={result} onRun={runAgent} loading={loading} />}
                {tab === 'actions'      && <ActionsTab stage={stage} log={log} result={result} onRun={runAgent} loading={loading} />}
                {tab === 'atlas'        && (
                  <div style={{ height: '60vh', minHeight: '400px' }} className="rounded-xl overflow-hidden border border-line">
                    <MapComponent weatherNodes={[]} fires={[]} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
