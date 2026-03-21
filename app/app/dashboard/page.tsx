'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ARVI_NODES, type NodeData } from '@/data/nodes'

type Tab = 'sensors' | 'intelligence' | 'actions'
type PipelineStage = 'idle' | 'sense' | 'analyze' | 'act' | 'pay' | 'done'

const PIPELINE = [
  { id: 'sense',   sym: '◎', label: 'Sense',   sub: 'Node data received' },
  { id: 'analyze', sym: '◈', label: 'Analyze', sub: 'LLM pattern analysis' },
  { id: 'act',     sym: '▸', label: 'Act',     sub: 'Alert + onchain log' },
  { id: 'pay',     sym: '○', label: 'Pay',     sub: 'USDC to operator' },
]
const STAGE_IDX: Record<PipelineStage, number> = { idle: 0, sense: 1, analyze: 2, act: 3, pay: 4, done: 5 }

function hcol(s: number) { return s < 0.4 ? '#FF5C3A' : s < 0.7 ? '#FFC64D' : '#5CFFD0' }
function aqcol(aqi: number) { return aqi < 50 ? '#5CFFD0' : aqi < 100 ? '#FFC64D' : aqi < 150 ? '#FF9F5C' : '#FF5C3A' }
function aqLabel(aqi: number) { return aqi < 50 ? 'Good' : aqi < 100 ? 'Moderate' : aqi < 150 ? 'Unhealthy*' : 'Unhealthy' }

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full" initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.8 }}
        style={{ background: color }} />
    </div>
  )
}

interface LogEntry { ts: string; type: string; msg: string; color: string }

interface WeatherData {
  temperature_2m?: number
  relative_humidity_2m?: number
  wind_speed_10m?: number
  uv_index?: number
  precipitation?: number
}

// ─── Sensor Tab ───────────────────────────────────────────────────────────────
function SensorTab({ node }: { node: NodeData }) {
  const c = hcol(node.health_score)
  const metrics = [
    { group: 'Microclimate',
      rows: [
        { label: 'Temperature', val: `${node.temperature_c}°C`, sub: 'Canopy-level (not city avg)', color: node.temperature_c > 30 ? '#FF5C3A' : '#F0EDE8', bar: node.temperature_c, max: 45 },
        { label: 'Humidity', val: `${node.humidity_pct}%`, sub: 'Root zone saturation', color: node.humidity_pct < 35 ? '#FFC64D' : '#F0EDE8', bar: node.humidity_pct, max: 100 },
        { label: 'UV Index', val: `${node.uv_index}`, sub: 'At canopy base', color: node.uv_index > 8 ? '#FF9F5C' : '#F0EDE8', bar: node.uv_index, max: 12 },
        { label: 'CO₂', val: `${node.co2_ppm} ppm`, sub: 'Canopy air column', color: '#F0EDE8', bar: node.co2_ppm - 350, max: 200 },
      ]
    },
    { group: 'Soil & Water',
      rows: [
        { label: 'Soil Moisture', val: `${node.soil_moisture_pct}%`, sub: 'Root zone saturation', color: node.soil_moisture_pct < 25 ? '#FF5C3A' : '#F0EDE8', bar: node.soil_moisture_pct, max: 100 },
      ]
    },
    { group: 'Air Quality',
      rows: [
        { label: 'AQI', val: `${node.air_quality_index}`, sub: aqLabel(node.air_quality_index) + ' · PM2.5/PM10 specific', color: aqcol(node.air_quality_index), bar: node.air_quality_index, max: 300 },
      ]
    },
    { group: 'Ecosystem Health',
      rows: [
        { label: 'Biodiversity Score', val: `${(node.biodiversity_score * 100).toFixed(0)}%`, sub: 'Audio sensor — species presence index', color: node.biodiversity_score < 0.4 ? '#FF5C3A' : '#F0EDE8', bar: node.biodiversity_score * 100, max: 100 },
        { label: 'Pathogen Risk', val: `${(node.pathogen_risk * 100).toFixed(0)}%`, sub: 'AI-computed from all inputs', color: node.pathogen_risk > 0.6 ? '#FF5C3A' : node.pathogen_risk > 0.3 ? '#FFC64D' : '#5CFFD0', bar: node.pathogen_risk * 100, max: 100 },
        { label: 'Canopy Density', val: `${node.canopy_density_pct}%`, sub: 'Visual sensor — tree cover', color: node.canopy_density_pct < 50 ? '#FFC64D' : '#F0EDE8', bar: node.canopy_density_pct, max: 100 },
      ]
    },
  ]

  return (
    <div className="space-y-5">
      {/* What this node measures */}
      <div className="rounded-xl border border-white/5 bg-surface p-5">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">What this node measures</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            { sym: '◎', label: 'Canopy microclimate', sub: 'Tree-level, not city average' },
            { sym: '◈', label: 'Root zone moisture',   sub: 'Underground saturation' },
            { sym: '▸', label: 'Biodiversity index',   sub: 'Audio sensor · species count' },
            { sym: '⬡', label: 'Pathogen indicators',  sub: 'Visual + chemical AI model' },
            { sym: '○', label: 'Air quality (AQI)',    sub: 'PM2.5/PM10 at canopy' },
            { sym: '—', label: 'Onchain signed',       sub: 'Cryptographic data proof' },
          ].map(item => (
            <div key={item.label} className="rounded-lg border border-white/5 bg-black/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-aqua">{item.sym}</span>
                <span className="font-mono text-[10px] text-parchment/70">{item.label}</span>
              </div>
              <p className="font-mono text-[9px] text-white/25">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sensor readings */}
      {metrics.map(group => (
        <div key={group.group} className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">{group.group}</p>
          <div className="space-y-4">
            {group.rows.map(row => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="font-mono text-[11px] text-parchment/60">{row.label}</span>
                    <span className="font-mono text-[9px] text-white/20 ml-2">{row.sub}</span>
                  </div>
                  <span className="font-mono text-sm font-bold" style={{ color: row.color }}>{row.val}</span>
                </div>
                <Bar value={row.bar} max={row.max} color={row.color} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Operator */}
      <div className="rounded-xl border border-white/5 bg-surface p-4">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-3">Node Identity</p>
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between"><span className="text-white/30">ENS</span><span className="text-violet">{node.ens}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Operator</span><span className="text-white/50">{node.operator_wallet.slice(0, 18)}...</span></div>
          <div className="flex justify-between"><span className="text-white/30">Species</span><span className="text-aqua">{node.dominant_species}</span></div>
          <div className="flex justify-between"><span className="text-white/30">Coordinates</span><span className="text-white/40">{node.lat}, {node.lon}</span></div>
        </div>
      </div>
    </div>
  )
}

// ─── Intelligence Tab ─────────────────────────────────────────────────────────
function IntelligenceTab({ node, result, onRun, loading }: {
  node: NodeData
  result: Record<string, unknown> | undefined
  onRun: () => void
  loading: boolean
}) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [fires, setFires] = useState<number>(0)

  useEffect(() => {
    fetch('/api/weather').then(r => r.json()).then(data => {
      const nodeWeather = data.nodes?.find((n: { node_id: string }) => n.node_id === node.node_id)
      if (nodeWeather?.weather) setWeather(nodeWeather.weather)
      setFires(data.fires?.length ?? 0)
    }).catch(() => {})
  }, [node.node_id])

  const analysis = result?.analysis as Record<string, unknown> | undefined

  return (
    <div className="space-y-5">
      {/* Contextual data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">◎ Live Weather Context <span className="text-aqua/40 normal-case">Open-Meteo</span></p>
          {weather ? (
            <div className="space-y-3 font-mono text-xs">
              {[
                { l: 'City temperature', v: `${weather.temperature_2m?.toFixed(1)}°C`, note: `vs node: ${node.temperature_c}°C canopy` },
                { l: 'City humidity',    v: `${weather.relative_humidity_2m}%`,         note: `vs node: ${node.humidity_pct}% root zone` },
                { l: 'Wind speed',       v: `${weather.wind_speed_10m} km/h` },
                { l: 'UV index (city)',  v: String(weather.uv_index?.toFixed(1)),       note: `vs node: ${node.uv_index} (canopy)` },
              ].map(row => (
                <div key={row.l} className="flex items-start justify-between">
                  <span className="text-white/30">{row.l}</span>
                  <div className="text-right">
                    <div className="text-parchment/70">{row.v}</div>
                    {row.note && <div className="text-[9px] text-aqua/40 mt-0.5">{row.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-mono text-[10px] text-white/20 animate-pulse">Fetching live data...</p>
          )}
        </div>

        <div className="rounded-xl border border-white/5 bg-surface p-5">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">◈ Satellite Intelligence <span className="text-terra/40 normal-case">NASA FIRMS</span></p>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/30">Fire hotspots (Mexico, 24h)</span>
              <span className={`font-bold ${fires > 20 ? 'text-terra' : fires > 5 ? 'text-solar' : 'text-aqua'}`}>{fires}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30">Node pathogen risk</span>
              <span style={{ color: node.pathogen_risk > 0.6 ? '#FF5C3A' : '#FFC64D' }}>
                {(node.pathogen_risk * 100).toFixed(0)}% — {node.pathogen_risk > 0.6 ? 'HIGH' : 'MEDIUM'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30">Biodiversity vs city avg</span>
              <span className={node.biodiversity_score < 0.5 ? 'text-terra' : 'text-aqua'}>
                {(node.biodiversity_score * 100).toFixed(0)}% {node.biodiversity_score < 0.5 ? '↓ below avg' : '↑ healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/30">Composite risk score</span>
              <span style={{ color: hcol(node.health_score) }}>
                {((1 - node.health_score) * 100).toFixed(0)}% risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern analysis */}
      <div className="rounded-xl border border-white/5 bg-surface p-5">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">▸ Agent Pattern Analysis</p>
        {analysis ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4"
              style={{ borderColor: `${hcol(node.health_score)}25`, background: `${hcol(node.health_score)}05` }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                  style={{ color: hcol(node.health_score), background: `${hcol(node.health_score)}15`, border: `1px solid ${hcol(node.health_score)}30` }}>
                  {String(analysis.severity ?? '').toUpperCase()} — {String(analysis.alert_type ?? '')}
                </span>
              </div>
              <p className="text-sm text-parchment/55 font-sans leading-relaxed mb-3">{String(analysis.description ?? '')}</p>
              <p className="font-mono text-xs text-aqua/60 italic">▸ {String(analysis.recommended_action ?? '')}</p>
              <p className="font-mono text-[10px] text-white/20 mt-2">
                Confidence: {((analysis.confidence as number ?? 0) * 100).toFixed(0)}% · {String(analysis.model_used ?? '')}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="font-mono text-sm text-white/25 mb-4">Run the agent to see intelligence analysis</p>
            <button onClick={onRun} disabled={loading}
              className="px-6 py-3 rounded-xl font-mono text-sm border border-aqua/30 bg-aqua/10 text-aqua hover:bg-aqua/20 transition-all disabled:opacity-40">
              {loading ? 'Analyzing...' : '▸ Run Agent Analysis'}
            </button>
          </div>
        )}
      </div>

      {/* Trend indicators */}
      <div className="rounded-xl border border-white/5 bg-surface p-5">
        <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">⬡ Trend Indicators</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Health trend', val: node.health_score < 0.5 ? '↓ declining' : '→ stable', color: node.health_score < 0.5 ? '#FF5C3A' : '#FFC64D' },
            { label: 'Biodiversity', val: node.biodiversity_score < 0.5 ? '↓ shrinking' : '→ stable', color: node.biodiversity_score < 0.5 ? '#FF5C3A' : '#5CFFD0' },
            { label: 'Soil moisture', val: node.soil_moisture_pct < 25 ? '↓ drying' : '→ adequate', color: node.soil_moisture_pct < 25 ? '#FFC64D' : '#5CFFD0' },
            { label: 'Pathogen risk', val: node.pathogen_risk > 0.5 ? '↑ rising' : '→ low', color: node.pathogen_risk > 0.5 ? '#FF5C3A' : '#5CFFD0' },
          ].map(t => (
            <div key={t.label} className="rounded-lg bg-black/20 border border-white/5 p-3 text-center">
              <p className="font-mono text-[9px] text-white/25 mb-1">{t.label}</p>
              <p className="font-mono text-xs font-bold" style={{ color: t.color }}>{t.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Actions Tab ──────────────────────────────────────────────────────────────
function ActionsTab({ stage, log, result, onRun, loading }: {
  stage: PipelineStage
  log: LogEntry[]
  result: Record<string, unknown> | undefined
  onRun: () => void
  loading: boolean
}) {
  const payment = result?.payment as Record<string, unknown> | undefined

  return (
    <div className="space-y-5">
      {/* Pipeline */}
      <div className="rounded-xl border border-white/5 bg-surface p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Agent Pipeline</p>
          <button onClick={onRun} disabled={loading}
            className="font-mono text-xs px-4 py-2 rounded-xl border border-aqua/30 bg-aqua/10 text-aqua hover:bg-aqua/20 transition-all disabled:opacity-40">
            {loading ? '◈ Running...' : '▸ Run Agent'}
          </button>
        </div>
        <div className="flex items-center gap-0">
          {PIPELINE.map((p, i) => {
            const active = STAGE_IDX[stage] === i + 1
            const done = STAGE_IDX[stage] > i + 1 || stage === 'done'
            return (
              <div key={p.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    animate={{ scale: active ? 1.15 : 1, boxShadow: active ? '0 0 20px rgba(92,255,208,0.4)' : 'none' }}
                    className="w-10 h-10 rounded-full border flex items-center justify-center font-mono text-base mb-2 transition-all"
                    style={{
                      borderColor: done ? '#5CFFD0' : active ? '#5CFFD0' : 'rgba(255,255,255,0.08)',
                      background: done ? '#5CFFD020' : active ? '#5CFFD010' : 'transparent',
                      color: done || active ? '#5CFFD0' : 'rgba(240,237,232,0.2)',
                    }}>
                    {done ? '✓' : p.sym}
                  </motion.div>
                  <p className="font-mono text-[10px] text-center" style={{ color: active || done ? '#F0EDE8' : 'rgba(240,237,232,0.25)' }}>{p.label}</p>
                  <p className="font-mono text-[9px] text-white/20 text-center mt-0.5">{p.sub}</p>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="h-px w-8 mx-1 shrink-0" style={{ background: STAGE_IDX[stage] > i + 1 || stage === 'done' ? '#5CFFD030' : 'rgba(255,255,255,0.05)' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment result */}
      <AnimatePresence>
        {payment && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-aqua/20 bg-aqua/5 p-5">
            <p className="font-mono text-[10px] text-aqua/60 uppercase tracking-widest mb-3">○ Payment Executed</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div><p className="text-white/25 mb-1">Amount</p><p className="text-aqua font-bold text-lg">{String(payment.amount_usdc ?? 0)} USDC</p></div>
              <div><p className="text-white/25 mb-1">Recipient</p><p className="text-white/50">{String(payment.recipient ?? '').slice(0, 14)}...</p></div>
              <div><p className="text-white/25 mb-1">Chain</p><p className="text-white/50">Base</p></div>
              <div><p className="text-white/25 mb-1">Status</p><p className="text-aqua">✓ Confirmed{Boolean(payment.simulated) ? ' (sim)' : ''}</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution log */}
      <div className="rounded-xl border border-white/5 bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Execution Log</p>
          <a href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json" target="_blank" rel="noopener"
            className="font-mono text-[10px] text-white/15 hover:text-aqua/40 transition-colors">agent_log.json ↗</a>
        </div>
        <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {log.map((entry, i) => (
              <motion.div key={`${entry.ts}-${i}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className="font-mono text-[10px] leading-relaxed">
                <span className="text-white/18">[{entry.ts}]</span>
                {' '}<span className="font-bold" style={{ color: entry.color }}>{entry.type}</span>
                {' '}<span className="text-white/40">{entry.msg}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNode, setActiveNode] = useState<NodeData>(ARVI_NODES[0])
  const [tab, setTab] = useState<Tab>('sensors')
  const [results, setResults] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<PipelineStage>('idle')
  const [log, setLog] = useState<LogEntry[]>([
    { ts: '06:47:00', type: 'INIT',     msg: 'ARVI network online — 6 EVVM contracts deployed', color: '#5CFFD0' },
    { ts: '07:04:00', type: 'IDENTITY', msg: 'ERC-8004 registered — Base Mainnet · 0xb8623d...', color: '#A78BFA' },
    { ts: '07:24:00', type: 'ANALYSIS', msg: 'Chapultepec plague confirmed — 95% confidence',    color: '#FF5C3A' },
    { ts: '07:24:01', type: 'PAYMENT',  msg: '9 USDC → 0x7099...79C8 via Locus',                color: '#5CFFD0' },
  ])
  const [now, setNow] = useState('')

  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().replace('T', ' ').slice(0, 19))
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  const addLog = (type: string, msg: string, color: string) => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [{ ts, type, msg, color }, ...prev].slice(0, 30))
  }

  const runAgent = useCallback(async () => {
    if (loading) return
    setLoading(true); setStage('sense'); setTab('actions')
    addLog('SENSE', `Data received — ${activeNode.node_id} · ${activeNode.location}`, '#5CFFD0')
    await new Promise(r => setTimeout(r, 700))
    setStage('analyze')
    addLog('ANALYZE', 'LLM analysis initiated — gemini-2.5-flash via Bankr Gateway', '#A78BFA')
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ node_id: activeNode.node_id }) })
      const data = await res.json()
      setResults(prev => ({ ...prev, [activeNode.node_id]: data }))
      setStage('act')
      const a = data.analysis as Record<string, unknown>
      addLog('ACT', `${String(a?.severity ?? '').toUpperCase()} · ${String(a?.alert_type ?? '')} · conf. ${((a?.confidence as number ?? 0) * 100).toFixed(0)}%`,
        a?.severity === 'critical' ? '#FF5C3A' : '#FFC64D')
      await new Promise(r => setTimeout(r, 500)); setStage('pay')
      const p = data.payment as Record<string, unknown>
      if (p) addLog('PAY', `${String(p.amount_usdc ?? 0)} USDC → ${String(p.recipient ?? '').slice(0, 14)}... via Locus`, '#5CFFD0')
      await new Promise(r => setTimeout(r, 400)); setStage('done')
    } catch (e) { addLog('ERROR', String(e), '#FF5C3A') }
    finally { setLoading(false); setTimeout(() => setStage('idle'), 2000) }
  }, [loading, activeNode])

  const networkHealth = ARVI_NODES.reduce((a, n) => a + n.health_score, 0) / ARVI_NODES.length
  const alertCount = ARVI_NODES.filter(n => n.anomaly_detected).length
  const result = results[activeNode.node_id]

  return (
    <div className="min-h-screen bg-void text-parchment flex flex-col">

      {/* Header */}
      <header className="shrink-0 border-b border-white/5 bg-void/95 backdrop-blur-md z-10">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors">← Back</Link>
            <div className="w-px h-4 bg-white/10" />
            <span className="font-mono text-sm text-parchment/80">◈ ARVI — Climate Intelligence</span>
          </div>
          <div className="flex items-center gap-5 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-white/30">
              <span className={`w-1.5 h-1.5 rounded-full ${alertCount > 0 ? 'bg-terra animate-pulse' : 'bg-aqua'}`} />
              {alertCount > 0 ? `${alertCount} ALERT${alertCount > 1 ? 'S' : ''}` : 'NOMINAL'}
            </div>
            <span className="text-white/18 hidden md:block">{now} UTC</span>
            <Link href="/atlas" className="text-white/30 hover:text-aqua/60 transition-colors hidden md:block">Atlas ◎</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* Node sidebar */}
        <aside className="w-60 shrink-0 border-r border-white/5 flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Network · CDMX</p>
          </div>
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Network Health</span>
              <span className="font-mono text-sm font-bold" style={{ color: hcol(networkHealth) }}>{(networkHealth * 100).toFixed(0)}%</span>
            </div>
            <Bar value={networkHealth * 100} color={hcol(networkHealth)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {ARVI_NODES.map(node => {
              const nc = hcol(node.health_score)
              const isActive = node.node_id === activeNode.node_id
              return (
                <button key={node.node_id} onClick={() => setActiveNode(node)}
                  className={`w-full text-left px-4 py-4 border-b border-white/5 transition-all ${isActive ? 'bg-aqua/5 border-l-2' : 'hover:bg-white/[0.015]'}`}
                  style={isActive ? { borderLeftColor: nc } : {}}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-white/35">{node.ens}</span>
                    <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: nc, background: `${nc}12`, border: `1px solid ${nc}25` }}>
                      {node.anomaly_detected ? 'ALERT' : node.health_score < 0.7 ? 'MON.' : 'OK'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-parchment/65 mb-2">{node.location.split(',')[0]}</p>
                  <div className="flex items-center gap-2">
                    <Bar value={node.health_score * 100} color={nc} />
                    <span className="font-mono text-[10px] shrink-0" style={{ color: nc }}>{(node.health_score * 100).toFixed(0)}%</span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
              target="_blank" rel="noopener" className="font-mono text-[9px] text-white/15 hover:text-aqua/30 transition-colors block">
              ERC-8004 on Base ↗
            </a>
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Node header + tabs */}
          <div className="border-b border-white/5 px-6 pt-4 pb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-[10px] text-white/25 mb-1">{activeNode.ens} · {activeNode.zone}</p>
                <h2 className="font-serif text-xl text-parchment">{activeNode.location}</h2>
                <p className="font-mono text-[10px] text-white/25 mt-1">{activeNode.dominant_species} · {activeNode.trees_monitored} trees monitored</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-mono text-[9px] text-white/20">Health</p>
                  <p className="font-serif text-2xl" style={{ color: hcol(activeNode.health_score) }}>{(activeNode.health_score * 100).toFixed(0)}%</p>
                </div>
                <button onClick={runAgent} disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs border border-aqua/30 bg-aqua/10 text-aqua hover:bg-aqua/20 transition-all disabled:opacity-40">
                  {loading ? <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-aqua/40 border-t-aqua rounded-full animate-spin" />Running</span> : '▸ Run Agent'}
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-1">
              {([['sensors','◎ Sensors'],['intelligence','◈ Intelligence'],['actions','▸ Actions']] as [Tab, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`font-mono text-xs px-4 py-2 rounded-t-lg border-b-2 transition-all ${tab === id ? 'text-aqua border-aqua' : 'text-white/30 border-transparent hover:text-white/50'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div key={tab + activeNode.node_id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                {tab === 'sensors' && <SensorTab node={activeNode} />}
                {tab === 'intelligence' && <IntelligenceTab node={activeNode} result={result} onRun={runAgent} loading={loading} />}
                {tab === 'actions' && <ActionsTab stage={stage} log={log} result={result} onRun={runAgent} loading={loading} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
