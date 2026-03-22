'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

const MiniWorldMap = dynamic(() => import('./components/MiniWorldMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0A0B14]" />,
})

// ─── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',        label: 'Intro',        darkBg: false },
  { id: 'system',       label: 'System',       darkBg: false },
  { id: 'what',         label: 'ARVI',         darkBg: false },
  { id: 'atlas',        label: 'Atlas',        darkBg: true  },
  { id: 'intelligence', label: 'Intelligence', darkBg: false },
  { id: 'economics',    label: 'Economics',    darkBg: false },
  { id: 'enter',        label: 'Enter',        darkBg: false },
]
const N = SECTIONS.length

// ─── Cursor hook ───────────────────────────────────────────────────────────────
function useCursor() {
  const rx = useMotionValue(0); const ry = useMotionValue(0)
  const x = useSpring(rx, { stiffness: 80, damping: 20 })
  const y = useSpring(ry, { stiffness: 80, damping: 20 })
  useEffect(() => {
    const fn = (e: MouseEvent) => { rx.set(e.clientX); ry.set(e.clientY) }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [rx, ry])
  return { x, y, rx, ry }
}

// ─── Animated network bg ───────────────────────────────────────────────────────
function NetworkBg({ active }: { active: boolean }) {
  const DOTS = [[8,12],[22,8],[40,14],[60,10],[78,8],[92,15],[5,38],[18,32],[35,42],[55,35],[72,28],[88,40],[12,62],[28,58],[48,68],[65,60],[82,55],[95,70],[6,82],[20,88],[42,78],[62,85],[80,75],[90,90]]
  const LINES = [[0,3],[1,4],[2,5],[3,6],[4,7],[5,8],[6,9],[7,10],[8,11],[9,12],[10,13],[11,14],[12,15],[13,16],[14,17],[15,18],[16,19],[17,20],[18,21],[19,22],[1,7],[4,9],[7,12],[10,15]]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: active ? 1 : 0, transition: 'opacity 1s ease' }}>
      {LINES.map(([a, b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return (
          <motion.line key={i} x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`} x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
            stroke="#E5E5E5" strokeWidth="0.8"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: i * 0.04 }} />
        )
      })}
      {DOTS.map(([cx, cy], i) => (
        <motion.circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="2" fill="none" stroke="#DADADA" strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 + 0.3 }} />
      ))}
      {[[0,4],[5,9],[10,14],[15,19]].map(([a,b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return (
          <motion.line key={`s${i}`} x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`} x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
            stroke="#2E7D6B" strokeWidth="1" strokeDasharray="4 8"
            animate={{ strokeDashoffset: [0, -36] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 1.4 }} />
        )
      })}
    </svg>
  )
}

// ─── Progress indicator (percentage-based, perfectly aligned) ──────────────────
function Progress({ section, setSection, dark }: { section: number; setSection: (n: number) => void; dark: boolean }) {
  const pct = useSpring(section / (N - 1) * 100, { stiffness: 120, damping: 25 })
  const leftPct = useTransform(pct, v => `${v}%`)

  useEffect(() => {
    pct.set(section / (N - 1) * 100)
  }, [section, pct])

  const ink = dark ? 'rgba(255,255,255,0.25)' : '#DADADA'
  const inkText = dark ? 'rgba(255,255,255,0.25)' : '#999'
  const active = dark ? 'rgba(255,255,255,0.9)' : '#2E7D6B'

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-14">
      {/* Track line */}
      <div className="relative h-px mb-4" style={{ background: ink }}>
        {/* Traveling node — percentage-aligned to track */}
        <motion.div
          className="absolute top-1/2 w-3 h-3 rounded-full border-2"
          style={{
            left: leftPct,
            y: '-50%',
            x: '-50%',
            borderColor: active,
            background: dark ? '#111' : 'white',
            boxShadow: `0 0 0 3px ${active}25`,
          }}
        />
      </div>

      {/* Section labels — same percentage positions as track */}
      <div className="relative h-6">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSection(i)}
            className="absolute flex flex-col items-center gap-1 group"
            style={{ left: `${(i / (N - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i === section ? active : ink,
                transform: i === section ? 'scale(1.8)' : 'scale(1)',
              }} />
            <span className="font-mono text-[8px] tracking-widest uppercase whitespace-nowrap transition-colors"
              style={{ color: i === section ? active : inkText }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Arrow nav buttons ─────────────────────────────────────────────────────────
function NavArrows({ section, setSection, dark }: { section: number; setSection: (n: number) => void; dark: boolean }) {
  const c = dark ? 'rgba(255,255,255,0.25)' : '#DADADA'
  const ch = dark ? 'white' : '#111'
  return (
    <>
      {section > 0 && (
        <button onClick={() => setSection(section - 1)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full border transition-all"
          style={{ borderColor: c, color: c }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ch; (e.currentTarget as HTMLButtonElement).style.color = ch }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c; (e.currentTarget as HTMLButtonElement).style.color = c }}>
          <span className="font-mono text-sm">←</span>
        </button>
      )}
      {section < N - 1 && (
        <button onClick={() => setSection(section + 1)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full border transition-all"
          style={{ borderColor: c, color: c }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ch; (e.currentTarget as HTMLButtonElement).style.color = ch }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c; (e.currentTarget as HTMLButtonElement).style.color = c }}>
          <span className="font-mono text-sm">→</span>
        </button>
      )}
    </>
  )
}

// ─── Nav bar ──────────────────────────────────────────────────────────────────
function NavBar({ dark }: { dark: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8"
      style={{ background: dark ? 'rgba(10,11,20,0.90)' : 'rgba(247,247,247,0.88)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#E5E5E5'}` }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded border flex items-center justify-center font-mono text-[10px]"
          style={{ borderColor: 'rgba(46,125,107,0.4)', background: dark ? 'rgba(46,125,107,0.15)' : '#EAF4F1', color: '#2E7D6B' }}>◈</div>
        <span className="font-mono text-sm" style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#111' }}>ARVI</span>
        <span className="hidden sm:block font-mono text-[9px] border rounded px-2 py-0.5"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : '#DADADA', color: dark ? 'rgba(255,255,255,0.25)' : '#888' }}>v6.0</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/atlas" className="font-mono text-[11px] transition-colors hidden sm:block"
          style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#888' }}>Atlas</Link>
        <Link href="/dashboard" className="font-mono text-[11px] px-4 py-1.5 rounded-lg border transition-all"
          style={{ borderColor: 'rgba(46,125,107,0.35)', background: dark ? 'rgba(46,125,107,0.15)' : '#EAF4F1', color: '#2E7D6B' }}>
          Launch App ▸
        </Link>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── S0: INTRO ────────────────────────────────────────────────────────────────
function IntroPlane({ active }: { active: boolean }) {
  const { rx, ry } = useCursor()
  const [nodes, setNodes] = useState<{ x: number; y: number; lit: boolean }[]>([])

  useEffect(() => {
    setNodes(Array.from({ length: 16 }, (_, i) => ({
      x: 6 + (i % 4) * 30 + (Math.floor(i / 4) % 2) * 15,
      y: 25 + Math.floor(i / 4) * 18,
      lit: false,
    })))
  }, [])

  useEffect(() => {
    if (!active) return
    const unsub = rx.on('change', () => {
      const lx = (rx.get() / window.innerWidth) * 100
      const ly = (ry.get() / window.innerHeight) * 100
      setNodes(prev => prev.map(n => ({ ...n, lit: Math.hypot(n.x - lx, n.y - ly) < 12 })))
    })
    return unsub
  }, [active, rx, ry])

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: '#F7F7F7' }}>
      <NetworkBg active={active} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((n, i) => (
          <g key={i}>
            <motion.circle cx={`${n.x}%`} cy={`${n.y}%`}
              fill={n.lit ? '#EAF4F1' : 'white'} stroke={n.lit ? '#2E7D6B' : '#DADADA'}
              strokeWidth={n.lit ? '1.5' : '1'}
              animate={{ r: n.lit ? 8 : 5 }} transition={{ duration: 0.2 }} />
            {n.lit && (
              <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r="8" fill="none" stroke="#2E7D6B" strokeWidth="0.5"
                initial={{ r: 8, opacity: 0.8 }} animate={{ r: 22, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }} />
            )}
          </g>
        ))}
      </svg>

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <motion.p className="font-mono text-[10px] text-muted tracking-[0.5em] uppercase mb-10"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Agentic Regeneration Via Intelligence
        </motion.p>
        <motion.h1 className="font-serif leading-none text-ink mb-6" style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 30 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          ARVI
        </motion.h1>
        <motion.p className="font-mono text-sm text-muted mb-3"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          in motion.
        </motion.p>
        {/* Fixed: was text-muted/50 (barely visible) → now text-ink/50 */}
        <motion.p className="font-mono text-[11px] tracking-widest" style={{ color: 'rgba(17,17,17,0.75)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
          A system that listens, learns, and responds.
        </motion.p>
        <motion.p className="font-mono text-[9px] mt-12 tracking-widest" style={{ color: 'rgba(17,17,17,0.75)' }}
          animate={{ opacity: active ? [0.35, 0.75, 0.35] : 0 }} transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}>
          move your cursor · press → to enter
        </motion.p>
      </div>
    </div>
  )
}

// ─── S1: SYSTEM ───────────────────────────────────────────────────────────────
const SYS_NODES = [
  { id: 'sensor',  x: 12, y: 50, label: 'Sensor',    sym: '○', micro: 'Hyperlocal signals.\nTree-level, not city averages.' },
  { id: 'data',    x: 30, y: 28, label: 'Data',       sym: '—', micro: 'Soil, air, biodiversity,\npathogen risk. Continuous.' },
  { id: 'agent',   x: 52, y: 50, label: 'Agent',      sym: '◈', micro: 'Interprets patterns.\nActs without waiting.' },
  { id: 'network', x: 72, y: 28, label: 'Network',    sym: '⬡', micro: 'Decentralized network for data collection, data analysis and action triggering across regions.' },
  { id: 'action',  x: 88, y: 50, label: 'Action',     sym: '▸', micro: 'Alerts onchain.\nOperators paid instantly.' },
]
const SYS_EDGES = [['sensor','data'],['sensor','agent'],['data','agent'],['agent','network'],['agent','action'],['network','action']]

function SystemPlane({ active }: { active: boolean }) {
  const [focused, setFocused] = useState<string | null>(null)
  const nm = Object.fromEntries(SYS_NODES.map(n => [n.id, n]))

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg-sm opacity-30" />
      <div className="relative z-10 w-full max-w-4xl px-8">
        <div className="text-center mb-10">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">The System</p>
          <h2 className="font-serif text-3xl text-ink">
            {focused
              ? nm[focused]?.label
              : <span className="text-muted/50">click any node</span>}
          </h2>
        </div>

        <div className="relative w-full" style={{ paddingBottom: '36%' }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            {SYS_EDGES.map(([a, b]) => {
              const na = nm[a]; const nb = nm[b]; if (!na || !nb) return null
              const isLit = focused === a || focused === b
              return (
                <motion.line key={`${a}-${b}`}
                  x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
                  stroke={isLit ? '#2E7D6B' : '#DADADA'} strokeWidth={isLit ? '1.5' : '1'}
                  strokeDasharray={isLit ? '4 6' : 'none'}
                  animate={isLit ? { strokeDashoffset: [0, -20] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
              )
            })}
            {SYS_NODES.map(node => {
              const isActive = focused === node.id
              const isDim = focused && focused !== node.id && !SYS_EDGES.some(([a, b]) => (a === focused && b === node.id) || (b === focused && a === node.id))
              return (
                <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => setFocused(isActive ? null : node.id)}>
                  <motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                    fill={isActive ? '#EAF4F1' : 'white'}
                    stroke={isActive ? '#2E7D6B' : '#DADADA'}
                    strokeWidth={isActive ? '1.5' : '1'}
                    animate={{ r: isActive ? 22 : 16, opacity: isDim ? 0.3 : 1 }}
                    transition={{ duration: 0.25 }} />
                  {isActive && <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} r="22" fill="none" stroke="#2E7D6B" strokeWidth="0.5"
                    initial={{ r: 22, opacity: 0.6 }} animate={{ r: 38, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} />}
                  <text x={`${node.x}%`} y={`${node.y}%`} textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? '#2E7D6B' : '#888'} style={{ fontSize: '13px', fontFamily: 'DM Mono,monospace', pointerEvents: 'none', userSelect: 'none' }}>
                    {node.sym}
                  </text>
                  <text x={`${node.x}%`} y={`${node.y + 10}%`} textAnchor="middle"
                    fill={isActive ? '#111' : '#888'} style={{ fontSize: '8px', fontFamily: 'DM Mono,monospace', pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="h-16 flex items-center justify-center mt-4">
          <AnimatePresence mode="wait">
            {focused ? (
              <motion.p key={focused} className="font-serif text-xl text-ink text-center"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {nm[focused]?.micro.replace('\n', ' ')}
              </motion.p>
            ) : (
              <motion.p key="idle" className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(17,17,17,0.75)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                — sensing → understanding → action —
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── S2: WHAT IS ARVI ─────────────────────────────────────────────────────────
const ARVI_FACTS = [
  {
    sym: '○',
    title: 'Sensor network',
    body: 'ESP32 nodes capture soil moisture, temperature, humidity, CO₂ and pathogen risk — hyperlocal, not city averages. Operators earn monthly USDC for uptime.',
  },
  {
    sym: '◈',
    title: 'Autonomous agent',
    body: 'An onchain AI agent analyzes each reading in real-time. When it detects an anomaly, it acts — publishes alerts, pays operators, and posts field jobs. Without waiting for a human.',
  },
  {
    sym: '▸',
    title: 'Onchain execution',
    body: 'Every decision is logged permanently via ERC-8004 on Base. Node operators receive USDC payments automatically. All decisions are auditable, transparent, and verifiable.',
  },
  {
    sym: '⬡',
    title: 'Open ecosystem',
    body: 'Buy a sensor kit ($80) or build your own with our open hardware. Data feeds are accessible via x402 pay-per-request — for other agents, researchers, or municipalities.',
  },
]

function WhatPlane({ active }: { active: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg-sm opacity-20" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <motion.div className="text-center mb-12"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">What is ARVI</p>
          <h2 className="font-serif text-4xl text-ink leading-tight">
            Cities should not only <em>measure</em><br />environmental problems.{' '}
            <span style={{ color: '#2E7D6B' }}>They should respond.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {ARVI_FACTS.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 20 }}
              transition={{ duration: 0.6, delay: active ? 0.15 + i * 0.1 : 0, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="rounded-2xl border bg-white p-6 cursor-default transition-all"
              style={{
                borderColor: hovered === i ? 'rgba(46,125,107,0.35)' : '#E5E5E5',
                boxShadow: hovered === i ? '0 4px 24px rgba(46,125,107,0.10)' : 'none',
              }}>
              <div className="flex items-start gap-4">
                <span className="font-mono text-xl shrink-0 mt-0.5" style={{ color: hovered === i ? '#2E7D6B' : '#DADADA' }}>
                  {f.sym}
                </span>
                <div>
                  <p className="font-mono text-[11px] tracking-widest uppercase mb-2"
                    style={{ color: hovered === i ? '#2E7D6B' : '#888' }}>{f.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#555' }}>{f.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p className="text-center font-mono text-[10px] mt-8" style={{ color: 'rgba(17,17,17,0.75)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.7 }}>
          sense → analyze → act → verify → pay → repeat
        </motion.p>
      </div>
    </div>
  )
}

// ─── S3: ATLAS (dark globe + live data overlay) ───────────────────────────────
function AtlasPlane({ active }: { active: boolean }) {
  const [liveData, setLiveData] = useState<{
    fires: number
    nodes: number
    temp: string
    humidity: string
    wind: string
    uv: string
  }>({ fires: 0, nodes: 3, temp: '--', humidity: '--', wind: '--', uv: '--' })
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!active || fetched) return
    setFetched(true)
    fetch('/api/weather')
      .then(r => r.json())
      .then(data => {
        const w = data.nodes?.[0]?.weather
        setLiveData({
          fires: data.fires?.length ?? 0,
          nodes: data.nodes?.length ?? 3,
          temp: w ? `${w.temperature_2m?.toFixed(1)}°C` : '--',
          humidity: w ? `${w.relative_humidity_2m}%` : '--',
          wind: w ? `${w.wind_speed_10m} km/h` : '--',
          uv: w ? String(w.uv_index?.toFixed(1)) : '--',
        })
      })
      .catch(() => {})
  }, [active, fetched])

  const dataFeeds = [
    { label: 'Fire hotspots', val: String(liveData.fires), src: 'NASA FIRMS · 24h Mexico', color: '#B85C00' },
    { label: 'Active nodes', val: String(liveData.nodes), src: 'ARVI Network · live',      color: '#2E7D6B' },
    { label: 'Air temp',     val: liveData.temp,          src: 'Open-Meteo · CDMX',        color: '#888' },
    { label: 'Humidity',     val: liveData.humidity,      src: 'Open-Meteo · live',         color: '#888' },
    { label: 'Wind',         val: liveData.wind,          src: 'Open-Meteo · live',         color: '#888' },
    { label: 'UV index',     val: liveData.uv,            src: 'Open-Meteo · live',         color: '#888' },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0A0B14' }}>
      {/* Globe fills the full section */}
      {active && (
        <div className="absolute inset-0">
          <MiniWorldMap className="w-full h-full" />
        </div>
      )}

      {/* Top-left label */}
      <div className="absolute top-20 left-10 z-20 pointer-events-none">
        <p className="font-mono text-[10px] text-white/30 tracking-[0.4em] uppercase mb-2">Atlas · Global Network</p>
        <h2 className="font-serif text-4xl text-white/90 leading-tight">
          The planet is not static.
        </h2>
        <p className="font-mono text-sm text-white/40 mt-2">
          Neither is its data.
        </p>
      </div>

      {/* Live data feeds — right side overlay */}
      <div className="absolute top-20 right-10 z-20 flex flex-col gap-2 w-56">
        {dataFeeds.map(item => (
          <motion.div key={item.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : 16 }}
            transition={{ duration: 0.5, delay: active ? dataFeeds.indexOf(item) * 0.08 : 0 }}
            className="rounded-lg border px-4 py-2.5"
            style={{ background: 'rgba(6,10,7,0.75)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest leading-none mb-0.5">{item.label}</p>
                <p className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.18)' }}>{item.src}</p>
              </div>
              <span className="font-mono text-base font-medium ml-3" style={{ color: item.color }}>{item.val}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-24 left-10 right-10 z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-pulse" />
            <span className="font-mono text-[10px] text-white/40">CDMX · 3 nodes active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D6B]/50" />
            <span className="font-mono text-[10px] text-white/30">Global expansion coming</span>
          </div>
        </div>
        <Link href="/atlas"
          className="font-mono text-[11px] px-5 py-2 rounded-xl border transition-all"
          style={{ borderColor: 'rgba(46,125,107,0.4)', color: '#2E7D6B', background: 'rgba(46,125,107,0.08)' }}>
          Full Atlas ↗
        </Link>
      </div>
    </div>
  )
}

// ─── S4: INTELLIGENCE — draggable agent whiteboard ───────────────────────────
const INTEL_CARDS = [
  {
    id: 'patterns',
    sym: '◈',
    title: 'Pattern Detection',
    body: 'Soil moisture at Chapultepec dropping 2.3%/day for 11 consecutive days. Pathogen spore count 3× baseline. Biodiversity score declining. Pattern confidence: 94%.',
    tag: 'CRITICAL PATTERN',
    tagColor: '#C0392B',
    initX: -260,
    initY: -80,
  },
  {
    id: 'prediction',
    sym: '▸',
    title: 'Predictive Model',
    body: 'At current trajectory: full plague outbreak in 18–21 days. 47 ahuehuete trees at risk. Estimated ecological loss: 340 tons CO₂/yr. Intervention window: now.',
    tag: 'FORECAST · 18d',
    tagColor: '#B85C00',
    initX: 100,
    initY: -110,
  },
  {
    id: 'response',
    sym: '⬡',
    title: 'Autonomous Response',
    body: 'Agent executed: operator payment 8.5 USDC → confirmed onchain · alert logged via ERC-8004 · municipal notification queued · job board published.',
    tag: 'ACTION TAKEN',
    tagColor: '#2E7D6B',
    initX: -180,
    initY: 90,
  },
  {
    id: 'bounty',
    sym: '○',
    title: 'Field Job Posted',
    body: 'Plaga confirmada en Chapultepec [19.4133, -99.1905]. Tarea: inspección visual in-situ y reporte formal ante SEDEMA. Cualquier ciudadano puede reclamar este bounty.',
    tag: 'JOB BOARD · OPEN',
    tagColor: '#2E7D6B',
    initX: 220,
    initY: 50,
  },
]

function IntelligencePlane({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-25" />

      {/* Header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none w-full px-8">
        <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">Agent Intelligence</p>
        <h2 className="font-serif text-4xl text-ink leading-tight">
          Patterns invisible to humans.<br />
          <span style={{ color: '#2E7D6B' }}>Actions taken in seconds.</span>
        </h2>
        <p className="font-mono text-[10px] mt-4" style={{ color: 'rgba(17,17,17,0.75)' }}>
          drag cards · rearrange the intelligence
        </p>
      </div>

      {/* Draggable cards */}
      <div className="absolute inset-0 flex items-center justify-center">
        {INTEL_CARDS.map((card, idx) => (
          <motion.div
            key={card.id}
            drag
            dragMomentum={false}
            initial={{ x: card.initX, y: card.initY, opacity: 0, scale: 0.92 }}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.92 }}
            transition={{ duration: 0.55, delay: active ? idx * 0.1 : 0, ease: [0.16, 1, 0.3, 1] }}
            whileDrag={{ scale: 1.04, boxShadow: '0 20px 60px rgba(0,0,0,0.14)', zIndex: 100 }}
            whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}
            className="absolute w-72 rounded-2xl border bg-white p-5 cursor-grab active:cursor-grabbing"
            style={{ borderColor: '#E5E5E5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', userSelect: 'none', zIndex: 10 }}>
            <div className="flex items-start gap-3 mb-3">
              <span className="font-mono text-lg shrink-0 mt-0.5" style={{ color: card.tagColor }}>{card.sym}</span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-mono text-[10px] font-medium text-ink leading-tight">{card.title}</p>
                  <span className="font-mono text-[8px] px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color: card.tagColor, borderColor: `${card.tagColor}30`, background: `${card.tagColor}10` }}>
                    {card.tag}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#555' }}>{card.body}</p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <Link href="/dashboard"
          className="font-mono text-[12px] px-8 py-3 rounded-xl transition-all"
          style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
          Full Dashboard ▸
        </Link>
      </div>
    </div>
  )
}

// ─── S5: ECONOMICS — new business model ──────────────────────────────────────
const BIZ_STREAMS = [
  { sym: '○', label: 'Hardware',   val: '$80 USD', desc: 'Sensor kit — plug & earn',     note: 'or DIY open source + 3D print' },
  { sym: '◈', label: 'Data API',   val: 'x402',    desc: 'Pay-per-request data feed',    note: 'AI agents · researchers · cities' },
  { sym: '▸', label: 'Job Board',  val: '5–20 USDC', desc: 'Field validation bounties', note: 'Humans confirm AI-detected alerts' },
  { sym: '⬡', label: 'Operators', val: 'Monthly',  desc: 'Sensor uptime rewards',       note: 'Paid in USDC, automatically' },
]

const JOB_BOARD = [
  {
    alert: 'PLAGA · Chapultepec',
    task: 'Inspección visual in-situ + reporte ante SEDEMA en [19.4133, -99.1905]',
    bounty: '12 USDC',
    color: '#C0392B',
    status: 'OPEN',
  },
  {
    alert: 'SEQUÍA · Alameda',
    task: 'Toma de muestra de suelo + documentación fotográfica de canopy',
    bounty: '8 USDC',
    color: '#B85C00',
    status: 'OPEN',
  },
  {
    alert: 'CALIDAD DE AIRE · Tlatelolco',
    task: 'Lectura manual con medidor AQI — validar calibración del sensor',
    bounty: '5 USDC',
    color: '#B85C00',
    status: 'CLAIMED',
  },
]

function EconomicsPlane() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">Business Model</p>
          <h2 className="font-serif text-4xl text-ink">
            Self-funded.<br />
            <span style={{ color: '#2E7D6B' }}>Community-owned.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Revenue streams */}
          <div>
            <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Revenue Streams</p>
            <div className="space-y-2">
              {BIZ_STREAMS.map(s => (
                <div key={s.label} className="rounded-xl border bg-white p-4 flex items-center gap-4">
                  <span className="font-mono text-base shrink-0 w-5 text-center" style={{ color: '#DADADA' }}>{s.sym}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[10px] text-ink font-medium">{s.label}</p>
                      <span className="font-mono text-xs text-jade">{s.val}</span>
                    </div>
                    <p className="font-mono text-[9px] text-muted mt-0.5">{s.desc}</p>
                    <p className="font-mono text-[8px]" style={{ color: 'rgba(17,17,17,0.30)' }}>{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job board */}
          <div>
            <p className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Job Board — Live Example</p>
            <div className="space-y-2">
              {JOB_BOARD.map((job, i) => (
                <div key={i} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: job.color }} />
                      <span className="font-mono text-[10px] font-medium" style={{ color: job.color }}>{job.alert}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-jade">{job.bounty}</span>
                      <span className="font-mono text-[8px] px-2 py-0.5 rounded-full border"
                        style={{
                          color: job.status === 'OPEN' ? '#2E7D6B' : '#999',
                          borderColor: job.status === 'OPEN' ? '#2E7D6B40' : '#DADADA',
                          background: job.status === 'OPEN' ? '#EAF4F1' : 'transparent',
                        }}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-[9px]" style={{ color: 'rgba(17,17,17,0.50)' }}>{job.task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Standards & Compliance block */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          {[
            { label: 'Data standard', icon: '◈' },
            { label: 'x402 compatible', icon: '—' },
            { label: 'Compliance · ESG · Carbon MRV', icon: '⬡' },
            { label: 'Open source hardware', icon: '○' },
            { label: 'DIY · 3D printable', icon: '▸' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E5E5E5] bg-white px-3 py-3 text-center">
              <span className="font-mono text-sm" style={{ color: '#2E7D6B' }}>{item.icon}</span>
              <p className="font-mono text-[8px] text-ink leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── S6: ENTER ────────────────────────────────────────────────────────────────
function EnterPlane({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <motion.div className="w-px h-16 bg-[#DADADA] mx-auto mb-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} style={{ originY: 0 }} />

        <motion.p className="font-mono text-[10px] text-muted tracking-[0.5em] uppercase mb-8"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.4 }}>
          ARVI — Agentic Regeneration Via Intelligence
        </motion.p>

        <motion.h2 className="font-serif text-ink leading-tight mb-2"
          style={{ fontSize: 'clamp(38px, 5.5vw, 68px)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}>
          ARVI is not a dashboard.
        </motion.h2>

        <motion.h2 className="font-serif leading-tight mb-12"
          style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', color: '#2E7D6B' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.8, duration: 0.7 }}>
          It&apos;s an intelligence system.
        </motion.h2>

        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
          transition={{ delay: 1.1, duration: 0.5 }}>
          <Link href="/dashboard"
            className="font-mono text-[12px] font-bold px-8 py-3 rounded-xl transition-all"
            style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
            Launch App ▸
          </Link>
          <Link href="/atlas"
            className="font-mono text-[11px] px-6 py-3 rounded-xl border border-[#DADADA] text-muted hover:border-[#2E7D6B] hover:text-[#2E7D6B] transition-all">
            ○ View Atlas
          </Link>
          <Link href="/register"
            className="font-mono text-[11px] px-6 py-3 rounded-xl border border-[#DADADA] text-muted hover:border-[#2E7D6B] hover:text-[#2E7D6B] transition-all">
            Register Node
          </Link>
        </motion.div>

        <motion.div className="w-px h-16 bg-[#DADADA] mx-auto mt-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.3 }} style={{ originY: 0 }} />

        <motion.p className="font-mono text-[9px] mt-4" style={{ color: 'rgba(17,17,17,0.30)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.5 }}>
          ERC-8004 · Base Mainnet ·{' '}
          <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
            target="_blank" rel="noopener"
            className="underline hover:text-[#2E7D6B] transition-colors">0xb8623d...cf43a</a>
          {' '}· Pantera Labs 2026
        </motion.p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════
export default function Landing() {
  const [section, setSection] = useState(0)
  const scrollLocked = useRef(false)

  const advance = useCallback((dir: 1 | -1) => {
    if (scrollLocked.current) return
    scrollLocked.current = true
    setTimeout(() => { scrollLocked.current = false }, 1300)
    setSection(s => Math.max(0, Math.min(N - 1, s + dir)))
  }, [])

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (scrollLocked.current) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) < 20) return
      advance(delta > 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [advance])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance(1)
      if (e.key === 'ArrowLeft') advance(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  useEffect(() => {
    let startX = 0
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX
      if (Math.abs(dx) > 50) advance(dx > 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [advance])

  const dark = SECTIONS[section].darkBg

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: dark ? '#0A0B14' : '#F7F7F7' }}>
      <NavBar dark={dark} />

      {/* Horizontal strip */}
      <motion.div
        style={{ display: 'flex', width: `${N * 100}vw`, height: '100vh' }}
        animate={{ x: `${-section * 100}vw` }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><IntroPlane active={section === 0} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><SystemPlane active={section === 1} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><WhatPlane active={section === 2} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><AtlasPlane active={section === 3} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><IntelligencePlane active={section === 4} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EconomicsPlane /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EnterPlane active={section === 6} /></div>
      </motion.div>

      {/* Navigation */}
      <Progress section={section} setSection={setSection} dark={dark} />
      <NavArrows section={section} setSection={setSection} dark={dark} />
    </div>
  )
}
