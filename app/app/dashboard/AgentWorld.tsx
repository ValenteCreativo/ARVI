'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARVI_NODES } from '@/data/nodes'

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'pantera',  name: 'Pantera',   role: 'Analysis',     emoji: '🐆', color: '#2E7D6B' },
  { id: 'sentinel', name: 'Sentinel',  role: 'Monitoring',   emoji: '👁',  color: '#5e72e4' },
  { id: 'nexus',    name: 'Nexus',     role: 'Coordination', emoji: '⬡',  color: '#f5a623' },
  { id: 'orion',    name: 'Orion',     role: 'Field Ops',    emoji: '🌿', color: '#1a6b8a' },
  { id: 'vera',     name: 'Vera',      role: 'Verification', emoji: '◈',  color: '#7B2FFF' },
]

const TASKS = [
  'Scanning fire signatures…',
  'Correlating soil moisture…',
  'Running pathogen model…',
  'Issuing field bounty…',
  'Verifying sensor onchain…',
  'Analyzing CO₂ gradient…',
  'Predicting drought stress…',
  'Broadcasting flood alert…',
  'Reconciling USDC payouts…',
  'Cross-ref NASA FIRMS…',
  'Detecting PM2.5 drift…',
  'Filing SEMARNAT report…',
  'Emailing NGO partners…',
  'Calling park rangers…',
]

type AgentStatus = 'analyzing' | 'monitoring' | 'acting' | 'idle' | 'alert'

const STATUS_COLOR: Record<AgentStatus, string> = {
  analyzing:  '#5e72e4',
  monitoring: '#2E7D6B',
  acting:     '#00cc66',
  idle:       '#555',
  alert:      '#C0392B',
}

// ── Metric Gauge ──────────────────────────────────────────────────────────────
function Gauge({ label, value, unit, color, max = 100 }: { label: string; value: number; unit: string; color: string; max?: number }) {
  const pct = Math.min(value / max, 1)
  return (
    <div className="rounded-xl border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-baseline justify-between mb-2">
        <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
        <p className="font-mono text-sm font-bold" style={{ color }}>{value}<span className="text-[9px] ml-0.5 font-normal" style={{ color: 'rgba(255,255,255,0.30)' }}>{unit}</span></p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
    </div>
  )
}

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color, size = 8, animate: doAnimate = true }: { color: string; size?: number; animate?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {doAnimate && <span className="absolute rounded-full animate-ping opacity-40" style={{ width: size, height: size, background: color }} />}
      <span className="relative rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AgentWorld({ darkMode }: { darkMode?: boolean }) {
  const [tasks, setTasks]     = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [events, setEvents]   = useState<{ agent: string; msg: string; color: string }[]>([])
  const [actions, setActions] = useState(0)
  const [usdc, setUsdc]       = useState(0)
  const evMax = 4 // fixed visible slots — never grows

  // Init
  useEffect(() => {
    const initTasks: Record<string, string> = {}
    const initStatus: Record<string, AgentStatus> = {}
    AGENTS.forEach((a, i) => { initTasks[a.id] = TASKS[i]; initStatus[a.id] = 'monitoring' })
    setTasks(initTasks)
    setStatuses(initStatus)
  }, [])

  // Live simulation
  useEffect(() => {
    const pool: AgentStatus[] = ['analyzing', 'monitoring', 'acting', 'idle', 'alert']
    const interval = setInterval(() => {
      const a = AGENTS[Math.floor(Math.random() * AGENTS.length)]
      const newTask   = TASKS[Math.floor(Math.random() * TASKS.length)]
      const newStatus = pool[Math.floor(Math.random() * pool.length)]
      const earned = newStatus === 'acting' ? +(Math.random() * 6 + 2).toFixed(2) : 0

      setTasks(prev    => ({ ...prev,    [a.id]: newTask }))
      setStatuses(prev => ({ ...prev,    [a.id]: newStatus }))
      if (earned) setUsdc(u => +(u + earned).toFixed(2))
      setActions(n => n + 1)
      setEvents(prev => [{ agent: a.name, msg: newTask, color: a.color }, ...prev].slice(0, evMax))
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  const node0 = ARVI_NODES[0]
  const avgHealth = +(ARVI_NODES.reduce((s, n) => s + n.health_score, 0) / ARVI_NODES.length * 100).toFixed(0)

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'DM Mono', monospace", background: '#0D0F1C' }}>

      {/* ── Thin top bar ── */}
      <div className="shrink-0 px-5 py-2 flex items-center gap-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5">
          <PulseDot color="#2E7D6B" size={6} />
          <span className="text-[10px] font-bold" style={{ color: '#2E7D6B' }}>{AGENTS.length} agents</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PulseDot color="#5e72e4" size={6} animate={false} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.40)' }}>{actions} actions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PulseDot color="#00cc66" size={6} animate={false} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.40)' }}>${usdc.toFixed(2)} USDC earned</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <PulseDot color={avgHealth > 70 ? '#2E7D6B' : '#B85C00'} size={6} />
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.40)' }}>Network health {avgHealth}%</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 grid grid-cols-[1fr_200px] gap-0 overflow-hidden">

        {/* LEFT: Office + metrics ── */}
        <div className="flex flex-col gap-0 p-5 overflow-hidden">

          {/* Office grid */}
          <div className="mb-4">
            <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>⬡ Active Agents</p>
            <div className="grid grid-cols-5 gap-2">
              {AGENTS.map(agent => {
                const status = statuses[agent.id] ?? 'idle'
                const task   = tasks[agent.id] ?? '—'
                const sc     = STATUS_COLOR[status]
                const isSel  = selected === agent.id

                return (
                  <motion.div key={agent.id}
                    className="rounded-xl border p-3 cursor-pointer flex flex-col gap-2"
                    style={{
                      background: isSel ? `${agent.color}15` : 'rgba(255,255,255,0.03)',
                      borderColor: isSel ? agent.color : 'rgba(255,255,255,0.07)',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelected(s => s === agent.id ? null : agent.id)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>

                    {/* Avatar + status dot */}
                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl border mx-auto"
                      style={{ background: `${agent.color}18`, borderColor: `${agent.color}40` }}>
                      {agent.emoji}
                      <span className="absolute -top-0.5 -right-0.5 rounded-full border-2 border-[#0D0F1C]" style={{ width: 10, height: 10, background: sc }}>
                        {(status === 'alert' || status === 'acting') &&
                          <span className="absolute inset-0 rounded-full animate-ping" style={{ background: sc, opacity: 0.5 }} />}
                      </span>
                    </div>

                    {/* Name + role */}
                    <div className="text-center">
                      <p className="font-mono text-[10px] font-bold leading-tight" style={{ color: isSel ? agent.color : 'rgba(255,255,255,0.75)' }}>{agent.name}</p>
                      <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>{agent.role}</p>
                    </div>

                    {/* Status badge */}
                    <div className="text-center">
                      <span className="font-mono text-[8px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${sc}20`, color: sc }}>
                        {status}
                      </span>
                    </div>

                    {/* Task (truncated, updates in place) */}
                    <AnimatePresence mode="wait">
                      <motion.p key={task} className="font-mono text-[8px] leading-tight text-center"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}>
                        {task.length > 28 ? task.slice(0, 26) + '…' : task}
                      </motion.p>
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Metric gauges — 2 rows */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <Gauge label="CO₂ ppm"     value={node0?.co2_ppm ?? 420}          unit=" ppm" color="#B85C00" max={600} />
            <Gauge label="Soil moisture" value={node0?.soil_moisture_pct ?? 68} unit="%"   color="#2E7D6B" />
            <Gauge label="Air quality"  value={node0?.air_quality_index ?? 72}  unit=" AQI" color="#5e72e4" max={150} />
            <Gauge label="Biodiversity" value={node0?.biodiversity_score ? node0.biodiversity_score * 100 : 78} unit="%" color="#7B2FFF" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Gauge label="Temperature"  value={node0?.temperature_c ?? 24}      unit="°C"  color="#C0392B" max={50} />
            <Gauge label="Humidity"     value={node0?.humidity_pct ?? 61}        unit="%"   color="#1a6b8a" />
            <Gauge label="UV index"     value={node0?.uv_index ?? 5}            unit=" UV"  color="#f5a623" max={12} />
            <Gauge label="Network health" value={avgHealth}                      unit="%"   color="#2E7D6B" />
          </div>

        </div>

        {/* RIGHT: Event feed + node list ── */}
        <div className="flex flex-col border-l overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>

          {/* Fixed-height event feed (never grows) */}
          <div className="p-4 border-b flex-1" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>▸ Last actions</p>
            <div className="flex flex-col gap-2">
              {Array.from({ length: evMax }).map((_, i) => {
                const ev = events[i]
                if (!ev) return (
                  <div key={i} className="border-l-2 pl-2 py-0.5" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <p className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.13)' }}>—</p>
                  </div>
                )
                return (
                  <motion.div key={`${ev.agent}-${ev.msg}-${i}`}
                    className="border-l-2 pl-2 py-0.5" style={{ borderColor: ev.color }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <p className="font-mono text-[9px] font-semibold" style={{ color: ev.color }}>{ev.agent}</p>
                    <p className="font-mono text-[9px] leading-snug" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {ev.msg.length > 24 ? ev.msg.slice(0, 22) + '…' : ev.msg}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Node list */}
          <div className="p-4">
            <p className="font-mono text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>○ Nodes</p>
            {ARVI_NODES.map(n => {
              const hc = n.health_score > 0.7 ? '#2E7D6B' : n.health_score > 0.4 ? '#B85C00' : '#C0392B'
              return (
                <div key={n.node_id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <PulseDot color={hc} size={6} animate={n.anomaly_detected} />
                  <p className="font-mono text-[9px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.50)' }}>{n.location.split(',')[0]}</p>
                  <p className="font-mono text-[9px] font-bold" style={{ color: hc }}>{(n.health_score * 100).toFixed(0)}%</p>
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
