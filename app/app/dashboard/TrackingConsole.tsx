'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NodeData } from '@/data/nodes'

// ── Helpers ────────────────────────────────────────────────────────────────────
function healthColor(h: number) { return h > 0.7 ? '#2E7D6B' : h > 0.4 ? '#B85C00' : '#C0392B' }
function aqiLabel(v: number)    { return v < 50 ? 'Good' : v < 100 ? 'Moderate' : v < 150 ? 'Unhealthy·S' : 'Unhealthy' }

// ── Live event log for a node ──────────────────────────────────────────────────
const TEMPLATES = [
  (n: NodeData) => ({ msg: `Temp ${n.temperature_c}°C · humidity ${n.humidity_pct}% · reading confirmed`, type: 'DATA', color: '#2E7D6B' }),
  (n: NodeData) => ({ msg: `Pathogen risk ${(n.pathogen_risk * 100).toFixed(0)}% · ${n.pathogen_risk > 0.5 ? '⚠ elevated — field check queued' : 'within normal range'}`, type: n.pathogen_risk > 0.5 ? 'WARN' : 'DATA', color: n.pathogen_risk > 0.5 ? '#B85C00' : '#888' }),
  (n: NodeData) => ({ msg: `Biodiversity score ${(n.biodiversity_score * 100).toFixed(0)}% — audio sensor pass`, type: 'DATA', color: '#888' }),
  (n: NodeData) => ({ msg: `AQI ${n.air_quality_index} (${aqiLabel(n.air_quality_index)}) · CO₂ ${n.co2_ppm} ppm`, type: 'DATA', color: '#888' }),
  (n: NodeData) => ({ msg: `Soil moisture ${n.soil_moisture_pct}% · ${n.soil_moisture_pct < 25 ? '⚠ drought stress detected' : 'adequate'}`, type: n.soil_moisture_pct < 25 ? 'WARN' : 'DATA', color: n.soil_moisture_pct < 25 ? '#C0392B' : '#888' }),
  (n: NodeData) => ({ msg: `Health score ${(n.health_score * 100).toFixed(0)}% — ${n.anomaly_detected ? '⚠ anomaly flag active' : 'nominal'}`, type: n.anomaly_detected ? 'ALERT' : 'INIT', color: n.anomaly_detected ? '#C0392B' : '#2E7D6B' }),
  (n: NodeData) => ({ msg: `Canopy density ${n.canopy_density_pct}% · UV index ${n.uv_index}`, type: 'DATA', color: '#888' }),
  (n: NodeData) => ({ msg: `ERC-8004 telemetry packet signed · ${n.ens}`, type: 'CHAIN', color: '#5e72e4' }),
]

interface LogLine { ts: string; msg: string; type: string; color: string }

function useNodeLog(node: NodeData) {
  const [lines, setLines] = useState<LogLine[]>([])
  const idxRef = useRef(0)

  useEffect(() => {
    idxRef.current = 0
    // Seed with 4 historical lines
    const seed: LogLine[] = []
    for (let i = 3; i >= 0; i--) {
      const tpl = TEMPLATES[(idxRef.current + i) % TEMPLATES.length]
      const ev = tpl(node)
      const d = new Date(Date.now() - i * 18000)
      seed.push({ ts: d.toISOString().slice(11, 19), ...ev })
    }
    setLines(seed)
    idxRef.current = 4

    const interval = setInterval(() => {
      const tpl = TEMPLATES[idxRef.current % TEMPLATES.length]
      const ev = tpl(node)
      const ts = new Date().toISOString().slice(11, 19)
      setLines(prev => [{ ts, ...ev }, ...prev].slice(0, 12))
      idxRef.current++
    }, 4500)
    return () => clearInterval(interval)
  }, [node.node_id]) // eslint-disable-line

  return lines
}

// ── Telemetry Row ──────────────────────────────────────────────────────────────
function TelRow({ label, value, unit, bar, max, color, note }: {
  label: string; value: string | number; unit?: string; bar?: number; max?: number; color: string; note?: string
}) {
  const pct = bar !== undefined && max ? Math.min(100, (bar / max) * 100) : null
  return (
    <div className="py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
          {note && <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.22)' }}>{note}</span>}
        </div>
        <span className="font-mono text-sm font-semibold tabular-nums" style={{ color }}>
          {value}{unit && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}> {unit}</span>}
        </span>
      </div>
      {pct !== null && (
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full" style={{ background: color }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      )}
    </div>
  )
}

// ── Signal dot ─────────────────────────────────────────────────────────────────
function Pulse({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span className="absolute inline-flex rounded-full animate-ping opacity-60" style={{ width: size, height: size, background: color }} />
      <span className="relative inline-flex rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TrackingConsole({ node, darkMode }: { node: NodeData; darkMode?: boolean }) {
  const hc = healthColor(node.health_score)
  const log = useNodeLog(node)
  const [now, setNow] = useState('')

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toISOString().replace('T', ' ').slice(0, 19)), 1000)
    return () => clearInterval(t)
  }, [])

  const bg     = '#0A0B14'
  const panel  = 'rgba(255,255,255,0.04)'
  const border = 'rgba(255,255,255,0.08)'

  return (
    <div className="rounded-2xl overflow-hidden font-mono" style={{ background: bg, border: `1px solid ${border}` }}>

      {/* ── Header strip ── */}
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}`, background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-3">
          <Pulse color={hc} />
          <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>{node.location}</span>
          <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: hc, borderColor: `${hc}40`, background: `${hc}15` }}>
            {(node.health_score * 100).toFixed(0)}% HEALTH
          </span>
          {node.anomaly_detected && (
            <span className="text-xs px-2 py-0.5 rounded-full border animate-pulse" style={{ color: '#C0392B', borderColor: '#C0392B40', background: '#C0392B15' }}>
              ⚠ ANOMALY
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>{node.ens}</span>
          <span className="text-xs tabular-nums" style={{ color: 'rgba(255,255,255,0.25)' }}>{now}</span>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-2 divide-x" style={{ borderColor: border }}>

        {/* LEFT: Telemetry */}
        <div className="p-5">
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: '#2E7D6B' }}>◈ Live Telemetry</p>

          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Microclimate</p>
            <TelRow label="Temperature" value={node.temperature_c} unit="°C" bar={node.temperature_c} max={45} color={node.temperature_c > 30 ? '#C0392B' : '#2E7D6B'} note="canopy" />
            <TelRow label="Humidity"    value={`${node.humidity_pct}%`}  bar={node.humidity_pct} max={100} color={node.humidity_pct < 35 ? '#B85C00' : '#2E7D6B'} note="root zone" />
            <TelRow label="CO₂"         value={`${node.co2_ppm}`} unit="ppm" bar={node.co2_ppm - 350} max={200} color="#888" />
            <TelRow label="UV Index"    value={node.uv_index} bar={node.uv_index} max={12} color={node.uv_index > 8 ? '#B85C00' : '#2E7D6B'} />
          </div>

          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Ecosystem</p>
            <TelRow label="Biodiversity"  value={`${(node.biodiversity_score*100).toFixed(0)}%`} bar={node.biodiversity_score*100} max={100} color={node.biodiversity_score < 0.4 ? '#C0392B' : '#2E7D6B'} note="audio AI" />
            <TelRow label="Pathogen Risk" value={`${(node.pathogen_risk*100).toFixed(0)}%`}      bar={node.pathogen_risk*100}       max={100} color={node.pathogen_risk > 0.6 ? '#C0392B' : node.pathogen_risk > 0.3 ? '#B85C00' : '#2E7D6B'} />
            <TelRow label="Canopy Density" value={`${node.canopy_density_pct}%`}                  bar={node.canopy_density_pct}      max={100} color={node.canopy_density_pct < 50 ? '#B85C00' : '#888'} />
            <TelRow label="Soil Moisture" value={`${node.soil_moisture_pct}%`}                    bar={node.soil_moisture_pct}       max={100} color={node.soil_moisture_pct < 25 ? '#C0392B' : '#2E7D6B'} note="30–60cm" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Air Quality</p>
            <TelRow label="AQI (PM2.5)" value={node.air_quality_index} bar={node.air_quality_index} max={300} color={node.air_quality_index > 100 ? '#C0392B' : node.air_quality_index > 50 ? '#B85C00' : '#2E7D6B'} note={aqiLabel(node.air_quality_index)} />
          </div>

          {/* Node metadata */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {[
              { l: 'Species', v: node.dominant_species.split('(')[0].trim() },
              { l: 'Trees',   v: `${node.trees_monitored} monitored` },
              { l: 'Lat/Lon', v: `${node.lat.toFixed(3)}, ${node.lon.toFixed(3)}` },
              { l: 'Node ID', v: node.node_id.toUpperCase() },
            ].map(i => (
              <div key={i.l} className="rounded-lg p-2.5" style={{ background: panel, border: `1px solid ${border}` }}>
                <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{i.l}</p>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.70)' }}>{i.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Event log */}
        <div className="p-5 flex flex-col">
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: '#2E7D6B' }}>▸ Event Stream</p>
          <div className="flex-1 space-y-1 overflow-hidden">
            <AnimatePresence>
              {log.map((line, i) => (
                <motion.div key={`${line.ts}-${i}`}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 py-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-[10px] tabular-nums shrink-0 mt-0.5" style={{ color: 'rgba(255,255,255,0.20)' }}>{line.ts}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold tracking-widest mr-2" style={{ color: line.color }}>{line.type}</span>
                    <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{line.msg}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Station footer */}
          <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${border}` }}>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { l: 'Status', v: node.anomaly_detected ? '⚠ ALERT' : '● NOMINAL', c: node.anomaly_detected ? '#C0392B' : '#2E7D6B' },
                { l: 'Uptime', v: '99.7%', c: '#2E7D6B' },
                { l: 'Chain', v: 'Base', c: '#5e72e4' },
              ].map(s => (
                <div key={s.l}>
                  <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.l}</p>
                  <p className="text-xs font-semibold" style={{ color: s.c }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
