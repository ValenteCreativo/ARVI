'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

const MiniWorldMap = dynamic(() => import('./components/MiniWorldMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full rounded-xl bg-[#0A0B14]" />,
})

// ─── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',      label: 'Intro',      darkBg: false },
  { id: 'system',     label: 'System',     darkBg: false },
  { id: 'what',       label: 'ARVI',       darkBg: false },
  { id: 'atlas',      label: 'Atlas',      darkBg: false },
  { id: 'dashboard',  label: 'Dashboard',  darkBg: false },
  { id: 'economics',  label: 'Economics',  darkBg: false },
  { id: 'enter',      label: 'Enter',      darkBg: false },
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

// ─── Progress indicator + traveling node ──────────────────────────────────────
function Progress({ section, setSection, dark }: { section: number; setSection: (n: number) => void; dark: boolean }) {
  const nodeX = useSpring(0, { stiffness: 120, damping: 25 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const w = containerRef.current.offsetWidth
    nodeX.set((section / (N - 1)) * (w - 16) + 8)
  }, [section, nodeX])

  const ink = dark ? 'rgba(255,255,255,0.3)' : '#DADADA'
  const inkText = dark ? 'rgba(255,255,255,0.25)' : '#888'
  const active = dark ? 'white' : '#2E7D6B'

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-12" ref={containerRef}>
      {/* Line */}
      <div className="relative h-px mb-3" style={{ background: ink }}>
        {/* Traveling node */}
        <motion.div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
          style={{ x: nodeX, marginLeft: '-6px', borderColor: active, background: 'white', boxShadow: `0 0 0 3px ${active}20` }} />
      </div>
      {/* Section dots + labels */}
      <div className="flex items-center" style={{ justifyContent: 'space-between' }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setSection(i)}
            className="flex flex-col items-center gap-1 group">
            <div className="w-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i === section ? active : ink, transform: i === section ? 'scale(2)' : 'scale(1)' }} />
            <span className="font-mono text-[8px] tracking-widest uppercase transition-colors"
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
  const c = dark ? 'rgba(255,255,255,0.3)' : '#DADADA'
  const ch = dark ? 'white' : '#111'
  return (
    <>
      {section > 0 && (
        <button onClick={() => setSection(section - 1)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full border transition-all"
          style={{ borderColor: c, color: c }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ch; (e.currentTarget as HTMLButtonElement).style.color = ch }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = c; (e.currentTarget as HTMLButtonElement).style.color = c }}>
          <span className="font-mono text-sm">←</span>
        </button>
      )}
      {section < N - 1 && (
        <button onClick={() => setSection(section + 1)}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 flex items-center justify-center rounded-full border transition-all"
          style={{ borderColor: c, color: c }} onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ch; (e.currentTarget as HTMLButtonElement).style.color = ch }}
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
      style={{ background: dark ? 'rgba(17,17,17,0.85)' : 'rgba(247,247,247,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#E5E5E5'}` }}>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded border flex items-center justify-center font-mono text-[10px]"
          style={{ borderColor: dark ? 'rgba(46,125,107,0.4)' : 'rgba(46,125,107,0.3)', background: dark ? 'rgba(46,125,107,0.15)' : '#EAF4F1', color: '#2E7D6B' }}>◈</div>
        <span className="font-mono text-sm" style={{ color: dark ? 'rgba(255,255,255,0.8)' : '#111' }}>ARVI</span>
        <span className="hidden sm:block font-mono text-[9px] border rounded px-2 py-0.5"
          style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : '#DADADA', color: dark ? 'rgba(255,255,255,0.2)' : '#888' }}>v5.0</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/atlas" className="font-mono text-[11px] transition-colors hidden sm:block"
          style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#888' }}>Atlas</Link>
        <Link href="/dashboard" className="font-mono text-[11px] px-4 py-1.5 rounded-lg border transition-all"
          style={{ borderColor: 'rgba(46,125,107,0.3)', background: '#EAF4F1', color: '#2E7D6B' }}>
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

      {/* Cursor-reactive nodes */}
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
          Environmental Intelligence
        </motion.p>
        <motion.h1 className="font-serif leading-none text-ink mb-6" style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 30 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          ARVI
        </motion.h1>
        <motion.p className="font-mono text-sm text-muted mb-2"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          in motion.
        </motion.p>
        <motion.p className="font-mono text-[11px] text-muted/50 tracking-widest"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.2, duration: 0.8 }}>
          A system that listens, learns, and responds.
        </motion.p>
        <motion.p className="font-mono text-[9px] text-muted/30 mt-12 tracking-widest"
          animate={{ opacity: active ? [0.3, 0.8, 0.3] : 0 }} transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}>
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
  { id: 'network', x: 72, y: 28, label: 'Network',    sym: '⬡', micro: 'Coordinates intelligence\nacross regions.' },
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
              <motion.p key="idle" className="font-mono text-[10px] text-muted/40 tracking-widest"
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
    body: 'ESP32 nodes deployed in urban forests capture soil moisture, temperature, humidity, and pathogen risk — hyperlocal, not city averages.',
  },
  {
    sym: '◈',
    title: 'Autonomous agent',
    body: 'An AI agent (Bankr/Gemini) analyzes each reading in real-time. When it detects an anomaly, it acts — without waiting for a human.',
  },
  {
    sym: '▸',
    title: 'Onchain execution',
    body: 'Every decision is logged permanently via ERC-8004 on Base. Node operators receive USDC payments automatically through Locus when they report quality data.',
  },
  {
    sym: '⬡',
    title: 'Self-sustaining economy',
    body: 'Municipalities and NGOs fund the treasury. The system pays its own AI inference, rewards operators, and generates verifiable public good impact.',
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

        <motion.p className="text-center font-mono text-[10px] text-muted/40 tracking-widest mt-8"
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.7 }}>
          sense → understand → decide → act → verify → incentivize
        </motion.p>
      </div>
    </div>
  )
}

// ─── S3: ATLAS ────────────────────────────────────────────────────────────────
function AtlasPlane({ active }: { active: boolean }) {
  const nodes = [
    { id: 'n01', label: 'Chapultepec', status: 'CRITICAL',   color: '#C0392B' },
    { id: 'n02', label: 'Alameda',     status: 'MONITORING', color: '#B85C00' },
    { id: 'n03', label: 'Tlatelolco',  status: 'MONITORING', color: '#B85C00' },
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-25" />

      <div className="relative z-10 w-full max-w-4xl px-8 pt-14">
        {/* Label + headline */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-2">Atlas</p>
            <h2 className="font-serif text-4xl text-ink">The planet is not static.</h2>
            <p className="text-muted text-sm mt-1">Neither is its data.</p>
          </div>
          <Link href="/atlas"
            className="font-mono text-[11px] px-5 py-2.5 rounded-xl border border-[#DADADA] text-muted hover:border-jade hover:text-jade transition-all shrink-0 ml-6">
            Open full Atlas ↗
          </Link>
        </div>

        {/* Map + nodes row */}
        <div className="flex items-stretch gap-5">
          {/* Map — fixed, compact */}
          <div className="rounded-xl overflow-hidden border border-[#E5E5E5]"
            style={{ width: '460px', height: '280px', flexShrink: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
            {active && <MiniWorldMap className="w-full h-full" />}
          </div>

          {/* Node list */}
          <div className="flex flex-col justify-center gap-3 flex-1">
            {nodes.map(n => (
              <div key={n.id} className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-white px-5 py-4">
                <div>
                  <p className="font-mono text-[11px] text-ink">{n.label}</p>
                  <p className="font-mono text-[9px] text-muted mt-0.5">CDMX · Active</p>
                </div>
                <span className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-full border"
                  style={{ color: n.color, borderColor: `${n.color}30`, background: `${n.color}10` }}>
                  {n.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── S3: DASHBOARD ────────────────────────────────────────────────────────────
const DASH_NODES = [
  { id: 'n01', name: 'Chapultepec', health: 0.34, status: 'CRITICAL', color: '#C0392B', alert: 'Probable plague detected. 47 ahuehuete trees.' },
  { id: 'n02', name: 'Alameda',     health: 0.71, status: 'WARNING',  color: '#B85C00', alert: 'Drought stress developing. Soil moisture low.' },
  { id: 'n03', name: 'Tlatelolco',  health: 0.52, status: 'WARNING',  color: '#B85C00', alert: 'AQI 112 — unhealthy. Canopy stress rising.' },
]

function DashboardPlane() {
  const [active, setActive] = useState(DASH_NODES[0])
  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">Dashboard</p>
            <h2 className="font-serif text-4xl text-ink">Active systems.</h2>
          </div>
          <Link href="/dashboard" className="font-mono text-[11px] px-5 py-2.5 rounded-xl border border-[#DADADA] text-muted hover:border-jade hover:text-jade transition-all">
            Full Dashboard ▸
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {DASH_NODES.map(n => (
            <motion.button key={n.id} onClick={() => setActive(n)}
              className="rounded-2xl border p-5 text-left transition-all"
              style={{ background: active.id === n.id ? 'white' : 'rgba(255,255,255,0.5)', borderColor: active.id === n.id ? n.color + '40' : '#E5E5E5', boxShadow: active.id === n.id ? `0 4px 24px ${n.color}15` : 'none' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-muted">{n.name}</span>
                <span className="font-mono text-[8px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: n.color, borderColor: `${n.color}30`, background: `${n.color}10` }}>{n.status}</span>
              </div>
              <div className="flex items-end justify-between">
                <div className="font-serif text-3xl" style={{ color: n.color }}>{(n.health * 100).toFixed(0)}%</div>
                <span className="font-mono text-[9px] text-muted">health</span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-[#E5E5E5] overflow-hidden">
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${n.health * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ background: n.color }} />
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border bg-white p-5 flex items-center justify-between"
            style={{ borderColor: `${active.color}25` }}>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: active.color }} />
              <p className="text-sm text-ink/70">{active.alert}</p>
            </div>
            <span className="font-mono text-[10px] text-muted shrink-0 ml-4">Agent response: active</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── S4: ECONOMICS ────────────────────────────────────────────────────────────
const FLOW_STEPS = [
  { sym: '○', label: 'Signal',    val: '432K/yr',  desc: 'Sensor readings', x: 12 },
  { sym: '◈', label: 'Verified',  val: '3 nodes',  desc: 'Onchain signed',  x: 38 },
  { sym: '▸', label: 'Rewarded',  val: '$720K/yr', desc: 'To operators',    x: 64 },
  { sym: '⬡', label: 'Protected', val: '280K',     desc: 'Trees by Year 3', x: 88 },
]

function EconomicsPlane() {
  const [step, setStep] = useState(-1)
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % FLOW_STEPS.length), 1200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-3">Economics</p>
          <h2 className="font-serif text-4xl text-ink">Self-sustaining,<br /><span style={{ color: '#2E7D6B' }}>not grant-dependent.</span></h2>
        </div>

        {/* Animated flow */}
        <div className="relative" style={{ paddingBottom: '22%', marginBottom: '40px' }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            {FLOW_STEPS.map((s, i) => {
              if (i === FLOW_STEPS.length - 1) return null
              const next = FLOW_STEPS[i + 1]
              const isActive = step === i || step === i + 1
              return (
                <g key={i}>
                  <motion.line x1={`${s.x + 6}%`} y1="50%" x2={`${next.x - 6}%`} y2="50%"
                    stroke={isActive ? '#2E7D6B' : '#E5E5E5'} strokeWidth={isActive ? '1.5' : '1'}
                    strokeDasharray={isActive ? '4 6' : 'none'}
                    animate={isActive ? { strokeDashoffset: [0, -20] } : {}}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  {isActive && (
                    <motion.circle r="4" fill="#2E7D6B"
                      animate={{ cx: [`${s.x + 6}%`, `${next.x - 6}%`] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} cy="50%" />
                  )}
                </g>
              )
            })}
            {FLOW_STEPS.map((s, i) => {
              const isActive = step === i
              return (
                <g key={s.label}>
                  <motion.circle cx={`${s.x}%`} cy="50%" r={isActive ? 28 : 20}
                    fill={isActive ? '#EAF4F1' : 'white'} stroke={isActive ? '#2E7D6B' : '#DADADA'}
                    strokeWidth={isActive ? '1.5' : '1'}
                    animate={{ r: isActive ? 28 : 20 }} transition={{ duration: 0.3 }} />
                  <text x={`${s.x}%`} y="50%" textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? '#2E7D6B' : '#888'}
                    style={{ fontSize: '14px', fontFamily: 'DM Mono,monospace', userSelect: 'none' }}>{s.sym}</text>
                  <text x={`${s.x}%`} y="76%" textAnchor="middle"
                    fill={isActive ? '#111' : '#888'}
                    style={{ fontSize: '9px', fontFamily: 'DM Mono,monospace', userSelect: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {FLOW_STEPS.map((s, i) => (
            <motion.div key={s.label} className="rounded-xl border bg-white p-4 text-center transition-all"
              animate={{ borderColor: step === i ? '#2E7D6B40' : '#E5E5E5', boxShadow: step === i ? '0 4px 20px rgba(46,125,107,0.12)' : 'none' }}>
              <div className="font-serif text-2xl mb-1" style={{ color: step === i ? '#2E7D6B' : '#111' }}>{s.val}</div>
              <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-0.5">{s.label}</div>
              <div className="font-mono text-[9px] text-muted/60">{s.desc}</div>
            </motion.div>
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
        {/* Divider top */}
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

        {/* Divider bottom */}
        <motion.div className="w-px h-16 bg-[#DADADA] mx-auto mt-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.3 }} style={{ originY: 0 }} />

        <motion.p className="font-mono text-[9px] text-muted/40 mt-4"
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
    // 1300ms covers full trackpad gesture deceleration tail
    setTimeout(() => { scrollLocked.current = false }, 1300)
    setSection(s => Math.max(0, Math.min(N - 1, s + dir)))
  }, [])

  // Wheel → horizontal (one section at a time, no skipping)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (scrollLocked.current) return
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      // Require meaningful intent — ignores micro scroll events
      if (Math.abs(delta) < 20) return
      advance(delta > 0 ? 1 : -1)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [advance])

  // Arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') advance(1)
      if (e.key === 'ArrowLeft') advance(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [advance])

  // Touch swipe
  useEffect(() => {
    let startX = 0
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX
      if (Math.abs(dx) > 50) advance(dx > 0 ? 1 : -1)
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd) }
  }, [advance])

  const dark = SECTIONS[section].darkBg

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: dark ? '#111111' : '#F7F7F7' }}>
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
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><DashboardPlane /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EconomicsPlane /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EnterPlane active={section === 6} /></div>
      </motion.div>

      {/* Navigation */}
      <Progress section={section} setSection={setSection} dark={dark} />
      <NavArrows section={section} setSection={setSection} dark={dark} />
    </div>
  )
}
