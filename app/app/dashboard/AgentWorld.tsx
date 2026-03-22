'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARVI_NODES } from '@/data/nodes'

// ── Agent definitions ─────────────────────────────────────────────────────────
const AGENTS = [
  { id: 'pantera',  name: 'Pantera',    role: 'Analysis',    emoji: '🐆', color: '#2E7D6B', x: 22, y: 38 },
  { id: 'sentinel', name: 'Sentinel',   role: 'Monitoring',  emoji: '👁',  color: '#5e72e4', x: 55, y: 25 },
  { id: 'nexus',    name: 'Nexus',      role: 'Coordination',emoji: '⬡',  color: '#f5a623', x: 78, y: 45 },
  { id: 'orion',    name: 'Orion',      role: 'Field Ops',   emoji: '🌿', color: '#1a6b8a', x: 38, y: 62 },
  { id: 'vera',     name: 'Vera',       role: 'Verification', emoji: '◈', color: '#7B2FFF', x: 65, y: 68 },
]

const TASK_POOL = [
  'Scanning Chapultepec fire signatures…',
  'Correlating soil moisture vs rainfall data…',
  'Running pathogen risk model — 94% confidence',
  'Comparing biodiversity scores across nodes…',
  'Issuing field bounty: 12 USDC · OPEN',
  'Verifying sensor reading onchain · ERC-8004',
  'Analyzing CO₂ gradient — Tlatelolco node',
  'Predicting drought stress index for next 72h',
  'Broadcasting alert to 3 NGO partners…',
  'Reconciling USDC payouts · Locus protocol',
  'Cross-referencing NASA FIRMS fire data…',
  'Detecting air quality drift pattern · PM2.5',
]

type AgentStatus = 'analyzing' | 'monitoring' | 'acting' | 'idle' | 'alert'

interface AgentState {
  id: string
  task: string
  status: AgentStatus
  pings: number
  lastAction: string
}

// ── Pulse dot ─────────────────────────────────────────────────────────────────
function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span className="absolute rounded-full animate-ping opacity-50" style={{ width: size, height: size, background: color }} />
      <span className="relative rounded-full" style={{ width: size, height: size, background: color }} />
    </span>
  )
}

// ── Connection line SVG between agents ───────────────────────────────────────
function ConnectionLines({ active }: { active: string | null }) {
  if (!active) return null
  const ag = AGENTS.find(a => a.id === active)
  if (!ag) return null
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
      {AGENTS.filter(a => a.id !== active).map(target => (
        <motion.line key={target.id}
          x1={`${ag.x}%`} y1={`${ag.y}%`}
          x2={`${target.x}%`} y2={`${target.y}%`}
          stroke={ag.color} strokeWidth="1" strokeDasharray="4 6" opacity="0.35"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.6 }} />
      ))}
    </svg>
  )
}

// ── Mini node dots on the world map ──────────────────────────────────────────
function NodeDots() {
  const positions = [
    { x: 30, y: 45, label: 'Chapultepec', health: 0.85, alert: true },
    { x: 50, y: 55, label: 'Alameda',     health: 0.72, alert: false },
    { x: 68, y: 38, label: 'Tlatelolco',  health: 0.61, alert: false },
  ]
  return (
    <>
      {positions.map(n => (
        <div key={n.label} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%,-50%)', zIndex: 3 }}>
          <div className="relative">
            {n.alert && <span className="absolute rounded-full animate-ping" style={{ width: 14, height: 14, top: -3, left: -3, background: '#C0392B', opacity: 0.4 }} />}
            <span className="relative flex rounded-full border border-white/20" style={{ width: 8, height: 8, background: n.health > 0.7 ? '#2E7D6B' : n.health > 0.4 ? '#B85C00' : '#C0392B' }} />
          </div>
          <p className="font-mono text-[8px] mt-1 text-center whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.label}</p>
        </div>
      ))}
    </>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AgentWorld({ darkMode }: { darkMode?: boolean }) {
  const [states, setStates] = useState<Record<string, AgentState>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [globalLog, setGlobalLog] = useState<{ ts: string; agent: string; msg: string; color: string }[]>([])
  const [totalActions, setTotalActions] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const logId = { current: 0 }

  // Init states
  useEffect(() => {
    const init: Record<string, AgentState> = {}
    AGENTS.forEach((a, i) => {
      init[a.id] = {
        id: a.id,
        task: TASK_POOL[i % TASK_POOL.length],
        status: 'monitoring',
        pings: 0,
        lastAction: 'Initialized',
      }
    })
    setStates(init)
  }, [])

  // Live agent simulation
  useEffect(() => {
    const statuses: AgentStatus[] = ['analyzing', 'monitoring', 'acting', 'idle', 'alert']
    const interval = setInterval(() => {
      const agentIdx = Math.floor(Math.random() * AGENTS.length)
      const agent = AGENTS[agentIdx]
      const newTask = TASK_POOL[Math.floor(Math.random() * TASK_POOL.length)]
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
      const earned = newStatus === 'acting' ? +(Math.random() * 8 + 2).toFixed(2) : 0

      setStates(prev => ({
        ...prev,
        [agent.id]: {
          ...prev[agent.id],
          task: newTask,
          status: newStatus,
          pings: (prev[agent.id]?.pings ?? 0) + 1,
          lastAction: newTask,
        },
      }))

      if (earned > 0) setTotalEarned(e => +(e + earned).toFixed(2))
      setTotalActions(n => n + 1)

      const ts = new Date().toISOString().slice(11, 19)
      setGlobalLog(prev => [{ ts, agent: agent.name, msg: newTask, color: agent.color }, ...prev].slice(0, 10))
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const statusColor: Record<AgentStatus, string> = {
    analyzing:  '#5e72e4',
    monitoring: '#2E7D6B',
    acting:     '#00ff88',
    idle:       '#555',
    alert:      '#C0392B',
  }

  const bg     = darkMode ? '#0A0B14' : '#0d0f1a'
  const panel  = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)'
  const border = 'rgba(255,255,255,0.08)'

  const selAgent   = selected ? AGENTS.find(a => a.id === selected) : null
  const selState   = selected ? states[selected] : null

  return (
    <div className="h-full flex flex-col" style={{ background: bg, fontFamily: "'DM Mono', monospace" }}>

      {/* ── Global metrics bar ── */}
      <div className="shrink-0 px-5 py-3 flex items-center gap-6 border-b" style={{ borderColor: border }}>
        {[
          { label: 'Agents Online', val: AGENTS.length, color: '#2E7D6B' },
          { label: 'Total Actions', val: totalActions, color: '#5e72e4' },
          { label: 'USDC Earned',   val: `$${totalEarned.toFixed(2)}`, color: '#00ff88' },
          { label: 'Nodes Active',  val: ARVI_NODES.length, color: '#f5a623' },
          { label: 'Alerts',        val: ARVI_NODES.filter(n => n.anomaly_detected).length, color: '#C0392B' },
        ].map(m => (
          <div key={m.label} className="flex items-center gap-2">
            <PulseDot color={m.color} />
            <div>
              <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.30)' }}>{m.label}</p>
              <p className="text-sm font-bold" style={{ color: m.color }}>{m.val}</p>
            </div>
          </div>
        ))}
        <div className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>ARVI Network · Base Mainnet · ERC-8004</div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex-1 grid grid-cols-[1fr_260px] overflow-hidden">

        {/* LEFT: World map with agents ── */}
        <div className="relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(46,125,107,0.06) 0%, transparent 70%)' }}>
          {/* Grid texture */}
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', zIndex: 1 }} />

          {/* Node dots */}
          <NodeDots />

          {/* Connection lines */}
          <ConnectionLines active={selected} />

          {/* Agents */}
          {AGENTS.map(agent => {
            const state = states[agent.id]
            const isSelected = selected === agent.id
            const sc = statusColor[state?.status ?? 'idle']

            return (
              <motion.div key={agent.id}
                className="absolute cursor-pointer"
                style={{ left: `${agent.x}%`, top: `${agent.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10 }}
                onClick={() => setSelected(s => s === agent.id ? null : agent.id)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>

                {/* Selection ring */}
                {isSelected && (
                  <motion.div className="absolute rounded-full border-2" style={{ inset: -10, borderColor: agent.color }}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
                )}

                {/* Agent body */}
                <div className="relative flex flex-col items-center">
                  {/* Status glow */}
                  <div className="absolute rounded-full" style={{ width: 48, height: 48, top: -4, left: -4, background: agent.color, opacity: 0.12, filter: 'blur(8px)' }} />

                  {/* Avatar */}
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center border-2 text-xl"
                    style={{ background: `${agent.color}20`, borderColor: isSelected ? agent.color : `${agent.color}50` }}>
                    {agent.emoji}
                    {/* Status dot */}
                    <span className="absolute -top-0.5 -right-0.5 rounded-full border border-[#0A0B14]" style={{ width: 10, height: 10, background: sc }} />
                    {state?.status === 'alert' && (
                      <span className="absolute -top-0.5 -right-0.5 rounded-full animate-ping" style={{ width: 10, height: 10, background: sc, opacity: 0.6 }} />
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-[9px] mt-1.5 font-bold whitespace-nowrap" style={{ color: isSelected ? agent.color : 'rgba(255,255,255,0.60)' }}>{agent.name}</p>

                  {/* Task bubble */}
                  {isSelected && state && (
                    <motion.div className="absolute w-44 rounded-xl border px-3 py-2 text-left"
                      style={{ top: '110%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', borderColor: `${agent.color}40`, zIndex: 20 }}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                      <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: agent.color }}>{state.status}</p>
                      <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.70)' }}>{state.task}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* "ARVI Network" watermark */}
          <div className="absolute bottom-4 left-4 z-10">
            <p className="text-[10px] font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.12)' }}>ARVI AGENT NETWORK · CDMX</p>
          </div>
        </div>

        {/* RIGHT: Panel ── */}
        <div className="flex flex-col border-l overflow-y-auto" style={{ borderColor: border }}>

          {/* Selected agent detail */}
          <AnimatePresence mode="wait">
            {selAgent && selState ? (
              <motion.div key={selAgent.id} className="p-4 border-b" style={{ borderColor: border }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border" style={{ background: `${selAgent.color}20`, borderColor: `${selAgent.color}50` }}>
                    {selAgent.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.90)' }}>{selAgent.name}</p>
                    <p className="text-[9px] uppercase tracking-widest" style={{ color: selAgent.color }}>{selState.status} · {selAgent.role}</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{selState.task}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Actions</p>
                    <p className="text-sm font-bold" style={{ color: selAgent.color }}>{selState.pings}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="hint" className="p-4 border-b" style={{ borderColor: border }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>Click an agent to inspect</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live log */}
          <div className="flex-1 p-4">
            <p className="text-[9px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.30)' }}>▸ Live Activity</p>
            <div className="space-y-2">
              {globalLog.map((entry, i) => (
                <motion.div key={`${entry.ts}-${i}`}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  className="border-l-2 pl-2.5 py-0.5" style={{ borderColor: entry.color }}>
                  <p className="text-[8px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{entry.ts} · <span style={{ color: entry.color }}>{entry.agent}</span></p>
                  <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.55)' }}>{entry.msg}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Node status */}
          <div className="p-4 border-t" style={{ borderColor: border }}>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.30)' }}>○ Sensor Nodes</p>
            {ARVI_NODES.map(n => (
              <div key={n.node_id} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <PulseDot color={n.health_score > 0.7 ? '#2E7D6B' : n.health_score > 0.4 ? '#B85C00' : '#C0392B'} size={6} />
                <p className="text-[10px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{n.location.split(',')[0]}</p>
                <p className="text-[10px] font-bold" style={{ color: n.health_score > 0.7 ? '#2E7D6B' : '#B85C00' }}>{(n.health_score*100).toFixed(0)}%</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
