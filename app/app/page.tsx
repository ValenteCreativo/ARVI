'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

// ─── Section config ────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',        label: 'Intro',        darkBg: false },
  { id: 'system',       label: 'System',       darkBg: false },
  { id: 'intelligence', label: 'Intelligence', darkBg: false },
  { id: 'what',         label: 'What',         darkBg: false },
  { id: 'network',      label: 'Network',      darkBg: false },
  { id: 'economics',    label: 'Economics',    darkBg: false },
  { id: 'enter',        label: 'Enter',        darkBg: false },
]
const N = SECTIONS.length

// ─── Cycling domain text ───────────────────────────────────────────────────────
const DOMAINS = [
  { label: 'Urban Forests',      color: '#2E7D6B' },
  { label: 'Aquatic Systems',    color: '#1a6b8a' },
  { label: 'Agricultural Zones', color: '#7d6b2e' },
  { label: 'Coastal Ecosystems', color: '#2e5b7d' },
  { label: 'River Basins',       color: '#2E7D6B' },
]

function CyclingDomain() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % DOMAINS.length), 2400)
    return () => clearInterval(t)
  }, [])
  const d = DOMAINS[idx]
  return (
    <AnimatePresence mode="wait">
      <motion.span key={d.label}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ color: d.color, display: 'inline-block' }}>
        {d.label}
      </motion.span>
    </AnimatePresence>
  )
}

// ─── Cursor hook ───────────────────────────────────────────────────────────────
function useCursor() {
  const rx = useMotionValue(0); const ry = useMotionValue(0)
  useEffect(() => {
    const fn = (e: MouseEvent) => { rx.set(e.clientX); ry.set(e.clientY) }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [rx, ry])
  return { rx, ry }
}

// ─── Animated network bg ───────────────────────────────────────────────────────
function NetworkBg({ active }: { active: boolean }) {
  const DOTS = [[8,12],[22,8],[40,14],[60,10],[78,8],[92,15],[5,38],[18,32],[35,42],[55,35],[72,28],[88,40],[12,62],[28,58],[48,68],[65,60],[82,55],[95,70],[6,82],[20,88],[42,78],[62,85],[80,75],[90,90]]
  const LINES = [[0,3],[1,4],[2,5],[3,6],[4,7],[5,8],[6,9],[7,10],[8,11],[9,12],[10,13],[11,14],[12,15],[13,16],[14,17],[15,18],[16,19],[17,20],[18,21],[19,22],[1,7],[4,9],[7,12],[10,15]]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: active ? 1 : 0, transition: 'opacity 1s ease' }}>
      {LINES.map(([a, b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return <motion.line key={i} x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`} x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
          stroke="#E5E5E5" strokeWidth="0.8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: i * 0.04 }} />
      })}
      {DOTS.map(([cx, cy], i) => (
        <motion.circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="2" fill="none" stroke="#DADADA" strokeWidth="1"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.03 + 0.3 }} />
      ))}
      {[[0,4],[5,9],[10,14],[15,19]].map(([a,b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return <motion.line key={`s${i}`} x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`} x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
          stroke="#2E7D6B" strokeWidth="1" strokeDasharray="4 8"
          animate={{ strokeDashoffset: [0, -36] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 1.4 }} />
      })}
    </svg>
  )
}

// ─── Progress indicator (percentage-based, perfectly aligned) ──────────────────
function Progress({ section, setSection, dark }: { section: number; setSection: (n: number) => void; dark: boolean }) {
  const pct = useSpring(section / (N - 1) * 100, { stiffness: 120, damping: 25 })
  const leftPct = useTransform(pct, v => `${v}%`)
  useEffect(() => { pct.set(section / (N - 1) * 100) }, [section, pct])

  const ink = dark ? 'rgba(255,255,255,0.25)' : '#DADADA'
  const inkText = dark ? 'rgba(255,255,255,0.30)' : 'rgba(17,17,17,0.45)'
  const active = dark ? 'rgba(255,255,255,0.9)' : '#2E7D6B'

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-14">
      <div className="relative h-px mb-4" style={{ background: ink }}>
        <motion.div className="absolute top-1/2 w-3 h-3 rounded-full border-2"
          style={{ left: leftPct, y: '-50%', x: '-50%', borderColor: active,
            background: dark ? '#0A0B14' : 'white', boxShadow: `0 0 0 3px ${active}25` }} />
      </div>
      <div className="relative h-6">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setSection(i)}
            className="absolute flex flex-col items-center gap-1 group"
            style={{ left: `${(i / (N - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i === section ? active : ink, transform: i === section ? 'scale(1.8)' : 'scale(1)' }} />
            <span className="font-mono text-[8px] tracking-widest uppercase whitespace-nowrap transition-colors"
              style={{ color: i === section ? active : inkText }}>{s.label}</span>
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
          style={{ borderColor: dark ? 'rgba(255,255,255,0.10)' : '#DADADA', color: dark ? 'rgba(255,255,255,0.25)' : '#888' }}>v6.1</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/atlas" className="font-mono text-[11px] transition-colors hidden sm:block" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#888' }}>Atlas</Link>
        <Link href="/dashboard" className="font-mono text-[11px] px-4 py-1.5 rounded-lg border transition-all"
          style={{ borderColor: 'rgba(46,125,107,0.35)', background: dark ? 'rgba(46,125,107,0.15)' : '#EAF4F1', color: '#2E7D6B' }}>
          Launch App ▸
        </Link>
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S0: INTRO
// ═══════════════════════════════════════════════════════════════════════════════
function IntroPlane({ active }: { active: boolean }) {
  const { rx, ry } = useCursor()
  const [nodes, setNodes] = useState<{ x: number; y: number; lit: boolean }[]>([])

  useEffect(() => {
    setNodes(Array.from({ length: 16 }, (_, i) => ({
      x: 6 + (i % 4) * 30 + (Math.floor(i / 4) % 2) * 15,
      y: 25 + Math.floor(i / 4) * 18, lit: false,
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
            <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} fill={n.lit ? '#EAF4F1' : 'white'}
              stroke={n.lit ? '#2E7D6B' : '#DADADA'} strokeWidth={n.lit ? '1.5' : '1'}
              animate={{ r: n.lit ? 8 : 5 }} transition={{ duration: 0.2 }} />
            {n.lit && <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r="8" fill="none" stroke="#2E7D6B" strokeWidth="0.5"
              initial={{ r: 8, opacity: 0.8 }} animate={{ r: 22, opacity: 0 }} transition={{ duration: 1, repeat: Infinity }} />}
          </g>
        ))}
      </svg>

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <motion.p className="font-mono text-[10px] tracking-[0.5em] uppercase mb-10"
          style={{ color: 'rgba(17,17,17,0.55)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          Agentic Regeneration Via Intelligence
        </motion.p>

        <motion.h1 className="font-serif leading-none text-ink mb-8" style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 30 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
          ARVI
        </motion.h1>

        {/* Cycling text */}
        <motion.div className="font-mono text-base mb-4" style={{ color: 'rgba(17,17,17,0.65)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
          The intelligence layer for{' '}
          <span className="inline-block min-w-[220px] text-left">
            {active && <CyclingDomain />}
          </span>
        </motion.div>

        <motion.p className="font-mono text-[12px]" style={{ color: 'rgba(17,17,17,0.55)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
          The first autonomous agent that detects environmental threats and acts — in seconds.
        </motion.p>

        <motion.p className="font-mono text-[9px] mt-12 tracking-widest" style={{ color: 'rgba(17,17,17,0.50)' }}
          animate={{ opacity: active ? [0.50, 0.75, 0.35] : 0 }} transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}>
          move your cursor · press → to enter
        </motion.p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S1: SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
const SYS_NODES = [
  { id: 'sensor',  x: 12, y: 50, label: 'Sensor',  sym: '○', micro: 'ESP32 nodes capture soil, air,\nbiodiversity and pathogen data. 24/7.' },
  { id: 'data',    x: 30, y: 28, label: 'Data',     sym: '—', micro: 'Temperature, humidity, CO₂, UV,\npathogen risk. Not city averages.' },
  { id: 'agent',   x: 52, y: 50, label: 'Agent',    sym: '◈', micro: 'LLM identifies invisible patterns,\npredicts risks, coordinates responses.' },
  { id: 'network', x: 72, y: 28, label: 'Network',  sym: '⬡', micro: 'Decentralized network for data collection, data analysis and action triggering across regions.' },
  { id: 'action',  x: 88, y: 50, label: 'Action',   sym: '▸', micro: 'Alerts issued · Jobs posted\nOperators rewarded monthly.' },
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
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(17,17,17,0.45)' }}>The System</p>
          <h2 className="font-serif text-3xl text-ink">
            {focused ? nm[focused]?.label : <span style={{ color: 'rgba(17,17,17,0.35)' }}>click any node</span>}
          </h2>
        </div>
        <div className="relative w-full" style={{ paddingBottom: '36%' }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            {SYS_EDGES.map(([a, b]) => {
              const na = nm[a]; const nb = nm[b]; if (!na || !nb) return null
              const isLit = focused === a || focused === b
              return <motion.line key={`${a}-${b}`} x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
                stroke={isLit ? '#2E7D6B' : '#DADADA'} strokeWidth={isLit ? '1.5' : '1'}
                strokeDasharray={isLit ? '4 6' : 'none'}
                animate={isLit ? { strokeDashoffset: [0, -20] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
            })}
            {SYS_NODES.map(node => {
              const isActive = focused === node.id
              const isDim = focused && focused !== node.id && !SYS_EDGES.some(([a, b]) => (a === focused && b === node.id) || (b === focused && a === node.id))
              return (
                <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => setFocused(isActive ? null : node.id)}>
                  <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} fill={isActive ? '#EAF4F1' : 'white'}
                    stroke={isActive ? '#2E7D6B' : '#DADADA'} strokeWidth={isActive ? '1.5' : '1'}
                    animate={{ r: isActive ? 22 : 16, opacity: isDim ? 0.3 : 1 }} transition={{ duration: 0.25 }} />
                  {isActive && <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} r="22" fill="none" stroke="#2E7D6B" strokeWidth="0.5"
                    initial={{ r: 22, opacity: 0.6 }} animate={{ r: 38, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} />}
                  <text x={`${node.x}%`} y={`${node.y}%`} textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? '#2E7D6B' : '#888'} style={{ fontSize: '13px', fontFamily: 'DM Mono,monospace', pointerEvents: 'none', userSelect: 'none' }}>{node.sym}</text>
                  <text x={`${node.x}%`} y={`${node.y + 10}%`} textAnchor="middle" fill={isActive ? '#111' : '#888'}
                    style={{ fontSize: '8px', fontFamily: 'DM Mono,monospace', pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{node.label}</text>
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
              <motion.p key="idle" className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(17,17,17,0.35)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                — sense → analyze → act → reward → verify —
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S2: INTELLIGENCE — draggable cards with live connected arrows
// ═══════════════════════════════════════════════════════════════════════════════
const INTEL_STEPS = [
  {
    id: 'detect',
    step: '01',
    sym: '○',
    title: 'Detect',
    body: 'Sensor captures hyperlocal data: soil moisture, temperature, CO₂, UV, biodiversity score, pathogen risk. Signals city-scale APIs cannot provide.',
    tag: 'DATA COLLECTION',
    tagColor: '#2E7D6B',
  },
  {
    id: 'analyze',
    step: '02',
    sym: '◈',
    title: 'Analyze',
    body: 'LLM agent correlates multi-stream data across time. Identifies patterns invisible to the human eye: slow-onset droughts, early-stage plague, air quality drift.',
    tag: 'PATTERN RECOGNITION',
    tagColor: '#2E7D6B',
  },
  {
    id: 'act',
    step: '03',
    sym: '▸',
    title: 'Act',
    body: 'Autonomous response chain: public alert issued · field job posted on bounty board · NGO and government agency notified · onchain log created via ERC-8004.',
    tag: 'AUTONOMOUS RESPONSE',
    tagColor: '#B85C00',
  },
  {
    id: 'verify',
    step: '04',
    sym: '⬡',
    title: 'Verify',
    body: 'Field worker confirms anomaly. Data validated onchain. Reading qualifies as verifiable climate evidence — usable for carbon credit issuance and ESG compliance.',
    tag: 'ONCHAIN VALIDATION',
    tagColor: '#2E7D6B',
  },
]

function IntelligencePlane({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Individual motion values for each card (rules of hooks: no loops)
  const c0x = useMotionValue(-300); const c0y = useMotionValue(0)
  const c1x = useMotionValue(-100); const c1y = useMotionValue(0)
  const c2x = useMotionValue(100);  const c2y = useMotionValue(0)
  const c3x = useMotionValue(300);  const c3y = useMotionValue(0)

  const [arrows, setArrows] = useState<{ x1: number; y1: number; x2: number; y2: number }[]>([])

  const updateArrows = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.offsetWidth / 2
    const ch = containerRef.current.offsetHeight / 2
    const pts = [
      { x: cw + c0x.get(), y: ch + c0y.get() },
      { x: cw + c1x.get(), y: ch + c1y.get() },
      { x: cw + c2x.get(), y: ch + c2y.get() },
      { x: cw + c3x.get(), y: ch + c3y.get() },
    ]
    setArrows([
      { x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y },
      { x1: pts[1].x, y1: pts[1].y, x2: pts[2].x, y2: pts[2].y },
      { x1: pts[2].x, y1: pts[2].y, x2: pts[3].x, y2: pts[3].y },
    ])
  }, [c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y])

  useEffect(() => {
    const t = setTimeout(updateArrows, 120)
    const subs = [
      c0x.on('change', updateArrows), c0y.on('change', updateArrows),
      c1x.on('change', updateArrows), c1y.on('change', updateArrows),
      c2x.on('change', updateArrows), c2y.on('change', updateArrows),
      c3x.on('change', updateArrows), c3y.on('change', updateArrows),
    ]
    window.addEventListener('resize', updateArrows)
    return () => { clearTimeout(t); subs.forEach(u => u()); window.removeEventListener('resize', updateArrows) }
  }, [updateArrows, c0x, c0y, c1x, c1y, c2x, c2y, c3x, c3y])

  const cardMotion = [
    { x: c0x, y: c0y }, { x: c1x, y: c1y }, { x: c2x, y: c2y }, { x: c3x, y: c3y },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-20" />

      {/* Header */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none w-full px-8">
        <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(17,17,17,0.45)' }}>Agent Intelligence</p>
        <h2 className="font-serif text-4xl text-ink leading-tight">
          Four steps. Fully autonomous.<br />
          <span style={{ color: '#2E7D6B' }}>No human required.</span>
        </h2>
        <p className="font-mono text-[10px] mt-4" style={{ color: 'rgba(17,17,17,0.35)' }}>
          drag cards · arrows follow
        </p>
      </div>

      {/* SVG arrows — live-tracked */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#2E7D6B" opacity="0.7" />
          </marker>
        </defs>
        {arrows.map((a, i) => {
          // Trim endpoints to not overlap card (approx 100px from center)
          const dx = a.x2 - a.x1; const dy = a.y2 - a.y1
          const len = Math.sqrt(dx*dx + dy*dy) || 1
          const trim = 104
          return (
            <line key={i}
              x1={a.x1 + (dx / len) * trim} y1={a.y1 + (dy / len) * trim}
              x2={a.x2 - (dx / len) * trim} y2={a.y2 - (dy / len) * trim}
              stroke="#2E7D6B" strokeWidth="1.5" strokeDasharray="5 7"
              markerEnd="url(#arrowhead)" opacity="0.6" />
          )
        })}
      </svg>

      {/* Draggable cards */}
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
        {INTEL_STEPS.map((card, idx) => {
          const mv = cardMotion[idx]
          return (
            <motion.div
              key={card.id}
              drag
              dragMomentum={false}
              style={{ x: mv.x, y: mv.y, zIndex: 10, borderColor: '#E5E5E5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', userSelect: 'none' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9 }}
              transition={{ duration: 0.5, delay: active ? idx * 0.1 : 0 }}
              whileDrag={{ scale: 1.04, zIndex: 50 }}
              whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}
              className="absolute w-56 rounded-2xl border bg-white p-4 cursor-grab active:cursor-grabbing">
              {/* Step number */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(17,17,17,0.30)' }}>STEP {card.step}</span>
                <span className="font-mono text-[8px] px-2 py-0.5 rounded-full border"
                  style={{ color: card.tagColor, borderColor: `${card.tagColor}30`, background: `${card.tagColor}10` }}>
                  {card.tag}
                </span>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <span className="font-mono text-base shrink-0" style={{ color: card.tagColor }}>{card.sym}</span>
                <p className="font-mono text-[11px] font-medium text-ink">{card.title}</p>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(17,17,17,0.60)' }}>{card.body}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <Link href="/dashboard" className="font-mono text-[12px] px-8 py-3 rounded-xl transition-all"
          style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
          See it live ▸
        </Link>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S3: WHAT IS ARVI — decentralized network + agent capabilities + carbon credits
// ═══════════════════════════════════════════════════════════════════════════════
const AGENT_ACTIONS = [
  { sym: '▸', label: 'Public alerts', desc: 'Real-time environmental threat broadcasts to registered subscribers and government platforms.' },
  { sym: '○', label: 'Field job board', desc: 'Posts paid field validation tasks (5–20 USDC) for human workers to confirm AI-detected anomalies.' },
  { sym: '◈', label: 'NGO outreach', desc: 'Automatically contacts registered environmental organizations when critical thresholds are crossed.' },
  { sym: '—', label: 'Gov notifications', desc: 'Triggers formal notifications to environmental agencies (SEDEMA, EPA equivalents) with evidence.' },
  { sym: '⬡', label: 'Carbon validation', desc: 'Sensor data used as verifiable evidence for carbon credit projects and ESG compliance reports.' },
  { sym: '○', label: 'Research data', desc: 'x402 pay-per-request API access for researchers, other AI agents, and decentralized science.' },
]

const ARVI_FACTS = [
  {
    sym: '○',
    title: 'Decentralized sensor network',
    body: 'ESP32 nodes deployed in urban forests, river basins, and agricultural zones. Each node is owned by an independent operator who earns monthly USDC rewards for data quality and uptime.',
  },
  {
    sym: '◈',
    title: 'Autonomous multi-agent AI',
    body: 'The ARVI agent detects invisible threats, predicts future risks, and coordinates a full response chain — alerts, payments, field jobs, NGO contact — without waiting for a human.',
  },
  {
    sym: '▸',
    title: 'Verifiable climate data',
    body: 'Every reading is timestamped and logged onchain via ERC-8004 on Base. Validated data qualifies as evidence for carbon credit issuance and ESG compliance reporting.',
  },
  {
    sym: '⬡',
    title: 'Open hardware ecosystem',
    body: 'Buy a sensor kit ($80, includes branded 3D-printed enclosure) or build your own with open-source hardware. Data is accessible via x402 pay-per-request for other agents and researchers.',
  },
]

function WhatPlane({ active }: { active: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [agentHovered, setAgentHovered] = useState<number | null>(null)

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg-sm opacity-20" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <motion.div className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(17,17,17,0.45)' }}>What is ARVI</p>
          <h2 className="font-serif text-4xl text-ink leading-tight">
            Not just monitoring.<br />
            <span style={{ color: '#2E7D6B' }}>Autonomous action.</span>
          </h2>
        </motion.div>

        {/* Fact cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ARVI_FACTS.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 20 }}
              transition={{ duration: 0.6, delay: active ? 0.1 + i * 0.08 : 0 }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              className="rounded-2xl border bg-white p-5 cursor-default transition-all"
              style={{ borderColor: hovered === i ? 'rgba(46,125,107,0.35)' : '#E5E5E5', boxShadow: hovered === i ? '0 4px 24px rgba(46,125,107,0.10)' : 'none' }}>
              <div className="flex items-start gap-3">
                <span className="font-mono text-lg shrink-0 mt-0.5" style={{ color: hovered === i ? '#2E7D6B' : '#DADADA' }}>{f.sym}</span>
                <div>
                  <p className="font-mono text-[10px] tracking-widest uppercase mb-1.5" style={{ color: hovered === i ? '#2E7D6B' : '#888' }}>{f.title}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(17,17,17,0.60)' }}>{f.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Agent actions row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.6 }}>
          <p className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: 'rgba(17,17,17,0.35)' }}>
            What the agent can do autonomously
          </p>
          <div className="flex flex-wrap gap-2">
            {AGENT_ACTIONS.map((a, i) => (
              <div key={a.label}
                onMouseEnter={() => setAgentHovered(i)} onMouseLeave={() => setAgentHovered(null)}
                className="relative rounded-lg border px-3 py-1.5 cursor-default transition-all"
                style={{ borderColor: agentHovered === i ? '#2E7D6B40' : '#DADADA', background: agentHovered === i ? '#EAF4F1' : 'white' }}>
                <span className="font-mono text-[10px]" style={{ color: agentHovered === i ? '#2E7D6B' : '#888' }}>
                  {a.sym} {a.label}
                </span>
                {agentHovered === i && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-[#E5E5E5] bg-white p-3 shadow-lg z-30">
                    <p className="font-mono text-[10px]" style={{ color: 'rgba(17,17,17,0.65)' }}>{a.desc}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S4: THE NETWORK — decentralized sensor network diagram
// ═══════════════════════════════════════════════════════════════════════════════
const NET_NODES = [
  { id: 'op1', x: 8,  y: 22, label: 'Chapultepec', role: 'operator', color: '#C0392B' },
  { id: 'op2', x: 8,  y: 50, label: 'Alameda',     role: 'operator', color: '#B85C00' },
  { id: 'op3', x: 8,  y: 78, label: 'Tlatelolco',  role: 'operator', color: '#B85C00' },
  { id: 'hub', x: 50, y: 50, label: 'ARVI Agent',  role: 'agent',    color: '#2E7D6B' },
  { id: 'al',  x: 88, y: 18, label: 'Public Alert',    role: 'output', color: '#888' },
  { id: 'jb',  x: 88, y: 36, label: 'Job Board',       role: 'output', color: '#888' },
  { id: 'cc',  x: 88, y: 54, label: 'Carbon Credit',   role: 'output', color: '#888' },
  { id: 'ng',  x: 88, y: 72, label: 'NGO / Gov Alert', role: 'output', color: '#888' },
  { id: 'ap',  x: 88, y: 90, label: 'Operator Reward', role: 'output', color: '#888' },
]

function NetworkPlane({ active }: { active: boolean }) {
  const [pulse, setPulse] = useState(0)
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setPulse(p => (p + 1) % 5), 1800)
    return () => clearInterval(t)
  }, [active])

  const nm = Object.fromEntries(NET_NODES.map(n => [n.id, n]))
  const edges = [
    ['op1','hub'],['op2','hub'],['op3','hub'],
    ['hub','al'],['hub','jb'],['hub','cc'],['hub','ng'],['hub','ap'],
  ]

  const INFO: Record<string, string> = {
    op1: 'Chapultepec node — CRITICAL. Plague detected. 47 ahuehuete trees at risk.',
    op2: 'Alameda node — WARNING. Soil moisture 12% below baseline.',
    op3: 'Tlatelolco node — WARNING. AQI 112. Canopy stress rising.',
    hub: 'ARVI Agent — Pantera. ERC-8004 registered on Base Mainnet. Analyzing 3 active nodes.',
    al:  'Public alert broadcast to 240 subscribers and municipal dashboard.',
    jb:  'Field validation job posted. Bounty: 12 USDC. Status: OPEN.',
    cc:  'Sensor data submitted as evidence for carbon credit verification via Octant.',
    ng:  'Formal notification sent to SEDEMA and partner NGOs with full data package.',
    ap:  'Monthly USDC reward sent automatically to all node operators with ≥95% uptime.',
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg-sm opacity-25" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(17,17,17,0.45)' }}>The Network</p>
          <h2 className="font-serif text-4xl text-ink leading-tight">
            Decentralized. Autonomous.<br />
            <span style={{ color: '#2E7D6B' }}>Always watching.</span>
          </h2>
        </div>

        <div className="relative w-full" style={{ paddingBottom: '40%' }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            <defs>
              <marker id="net-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="#2E7D6B" opacity="0.5" />
              </marker>
            </defs>

            {edges.map(([a, b], i) => {
              const na = nm[a]; const nb = nm[b]
              const isActive = focused === a || focused === b
              const isPulsing = pulse === i % 5
              return (
                <g key={`${a}-${b}`}>
                  <line x1={`${na.x}%`} y1={`${na.y}%`} x2={`${nb.x}%`} y2={`${nb.y}%`}
                    stroke={isActive ? '#2E7D6B' : '#E5E5E5'} strokeWidth={isActive ? '1.5' : '1'} />
                  {isPulsing && (
                    <motion.circle r="4" fill="#2E7D6B" opacity="0.8"
                      animate={{
                        cx: [`${na.x}%`, `${nb.x}%`],
                        cy: [`${na.y}%`, `${nb.y}%`],
                      }}
                      transition={{ duration: 1.2, ease: 'easeInOut' }} />
                  )}
                </g>
              )
            })}

            {NET_NODES.map(node => {
              const isActive = focused === node.id
              const r = node.role === 'agent' ? 26 : node.role === 'operator' ? 16 : 12
              return (
                <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => setFocused(isActive ? null : node.id)}>
                  <motion.circle cx={`${node.x}%`} cy={`${node.y}%`}
                    fill={isActive ? `${node.color}20` : 'white'} stroke={isActive ? node.color : '#DADADA'}
                    strokeWidth={isActive ? '1.5' : '1'}
                    animate={{ r: isActive ? r + 4 : r }}
                    transition={{ duration: 0.25 }} />
                  {node.role === 'agent' && active && (
                    <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} r={r}
                      fill="none" stroke="#2E7D6B" strokeWidth="0.8"
                      initial={{ r, opacity: 0.5 }} animate={{ r: r + 16, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }} />
                  )}
                  <text x={`${node.x}%`} y={`${node.y}%`} textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? node.color : '#888'}
                    style={{ fontSize: node.role === 'agent' ? '14px' : '9px', fontFamily: 'DM Mono,monospace', userSelect: 'none', pointerEvents: 'none' }}>
                    {node.role === 'agent' ? '◈' : node.role === 'operator' ? '○' : '▸'}
                  </text>
                  {node.role !== 'agent' && (
                    <text x={`${node.x + (node.role === 'output' ? 3 : -3)}%`} y={`${node.y - 7}%`}
                      textAnchor={node.role === 'output' ? 'start' : 'end'}
                      fill={isActive ? node.color : '#888'}
                      style={{ fontSize: '8px', fontFamily: 'DM Mono,monospace', userSelect: 'none', pointerEvents: 'none', letterSpacing: '0.04em' }}>
                      {node.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="h-14 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {focused ? (
              <motion.p key={focused} className="font-mono text-[11px] text-center max-w-lg"
                style={{ color: 'rgba(17,17,17,0.65)' }}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {INFO[focused]}
              </motion.p>
            ) : (
              <motion.p key="idle" className="font-mono text-[10px] tracking-widest"
                style={{ color: 'rgba(17,17,17,0.30)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                operators → agent → outputs · click any node
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S5: ECONOMICS — sensors + data + carbon credits + ESG + job board
// ═══════════════════════════════════════════════════════════════════════════════
const BIZ_STREAMS = [
  { sym: '○', label: 'Hardware',      val: '$80 USD',  desc: 'Sensor kit (branded 3D enclosure)', note: 'or DIY open-source hardware' },
  { sym: '◈', label: 'Data API',      val: 'x402',     desc: 'Pay-per-request data access',       note: 'for AI agents, researchers, cities' },
  { sym: '▸', label: 'Carbon Credits',val: 'MRV data', desc: 'Verifiable sensor data for projects', note: 'Octant · ESG compliance · registry' },
  { sym: '⬡', label: 'Job Board',     val: '5–20 USDC',desc: 'Field validation bounties',         note: 'Human-confirmed AI alerts' },
]

const JOB_BOARD_EN = [
  {
    alert: 'PLAGUE · Chapultepec',
    task: 'On-site inspection + formal report to SEDEMA at [19.4133, -99.1905]. Evidence photos required.',
    bounty: '12 USDC', color: '#C0392B', status: 'OPEN',
  },
  {
    alert: 'DROUGHT STRESS · Alameda',
    task: 'Soil sample collection + canopy photographic documentation at [19.4360, -99.1508].',
    bounty: '8 USDC', color: '#B85C00', status: 'OPEN',
  },
  {
    alert: 'AIR QUALITY · Tlatelolco',
    task: 'Manual AQI reading to validate sensor calibration at [19.4528, -99.1388].',
    bounty: '5 USDC', color: '#B85C00', status: 'CLAIMED',
  },
]

function EconomicsPlane() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative z-10 w-full max-w-5xl px-8">
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase mb-3" style={{ color: 'rgba(17,17,17,0.45)' }}>Business Model</p>
          <h2 className="font-serif text-4xl text-ink">
            Self-funded.<br />
            <span style={{ color: '#2E7D6B' }}>Community-owned.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Revenue streams */}
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: 'rgba(17,17,17,0.40)' }}>Revenue Streams</p>
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
                    <p className="font-mono text-[8px]" style={{ color: 'rgba(17,17,17,0.28)' }}>{s.note}</p>
                  </div>
                </div>
              ))}
              {/* Carbon credits highlight */}
              <div className="rounded-xl border border-jade/30 bg-[#EAF4F1] p-4">
                <p className="font-mono text-[9px] text-jade uppercase tracking-widest mb-1">◈ Carbon Credit Market</p>
                <p className="font-mono text-[10px]" style={{ color: 'rgba(17,17,17,0.65)' }}>
                  ARVI sensor data provides verifiable MRV (Monitoring, Reporting, Verification) evidence for environmental projects — enabling carbon credit issuance and ESG compliance reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Job board */}
          <div>
            <p className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: 'rgba(17,17,17,0.40)' }}>Job Board — Live Example</p>
            <div className="space-y-2">
              {JOB_BOARD_EN.map((job, i) => (
                <div key={i} className="rounded-xl border bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: job.color }} />
                      <span className="font-mono text-[10px] font-medium" style={{ color: job.color }}>{job.alert}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-jade">{job.bounty}</span>
                      <span className="font-mono text-[8px] px-2 py-0.5 rounded-full border"
                        style={{ color: job.status === 'OPEN' ? '#2E7D6B' : '#999', borderColor: job.status === 'OPEN' ? '#2E7D6B40' : '#DADADA', background: job.status === 'OPEN' ? '#EAF4F1' : 'transparent' }}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-[9px]" style={{ color: 'rgba(17,17,17,0.48)' }}>{job.task}</p>
                </div>
              ))}
            </div>
            {/* Operator model */}
            <div className="mt-3 rounded-xl border border-[#DADADA] bg-canvas p-4">
              <p className="font-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(17,17,17,0.40)' }}>Operator Model</p>
              <div className="space-y-1">
                {[
                  { label: 'Buy sensor kit', val: '$80 USD + branded case' },
                  { label: 'Build your own', val: 'Open hardware + GitHub' },
                  { label: 'Monthly reward', val: 'USDC · auto-paid by agent' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(17,17,17,0.45)' }}>{r.label}</span>
                    <span className="font-mono text-[9px] text-jade">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Standards strip — visible above the navbar */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { icon: '◈', label: 'Data standard', val: 'x402 compatible' },
            { icon: '⬡', label: 'Compliance',    val: 'ESG · Carbon MRV' },
            { icon: '○', label: 'Hardware',       val: 'Open source + DIY' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#E5E5E5] bg-white px-4 py-3">
              <span className="font-mono text-base shrink-0" style={{ color: '#2E7D6B' }}>{item.icon}</span>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-widest" style={{ color: 'rgba(17,17,17,0.40)' }}>{item.label}</p>
                <p className="font-mono text-[11px] font-medium text-ink mt-0.5">{item.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// S6: ENTER
// ═══════════════════════════════════════════════════════════════════════════════
function EnterPlane({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <motion.div className="w-px h-16 bg-[#DADADA] mx-auto mb-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} style={{ originY: 0 }} />
        <motion.p className="font-mono text-[10px] tracking-[0.5em] uppercase mb-8"
          style={{ color: 'rgba(17,17,17,0.45)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.4 }}>
          ARVI — Agentic Regeneration Via Intelligence
        </motion.p>
        <motion.h2 className="font-serif text-ink leading-tight mb-2" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 16 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}>
          ARVI is not a dashboard.
        </motion.h2>
        <motion.h2 className="font-serif leading-tight mb-12" style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', color: '#2E7D6B' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 0.8, duration: 0.7 }}>
          It&apos;s an intelligence system.
        </motion.h2>
        <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
          transition={{ delay: 1.1, duration: 0.5 }}>
          <Link href="/dashboard" className="font-mono text-[12px] font-bold px-8 py-3 rounded-xl transition-all"
            style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
            Launch App ▸
          </Link>
          <Link href="/atlas" className="font-mono text-[11px] px-6 py-3 rounded-xl border border-[#DADADA] text-muted hover:border-[#2E7D6B] hover:text-[#2E7D6B] transition-all">
            ○ View Atlas
          </Link>
          <Link href="/register" className="font-mono text-[11px] px-6 py-3 rounded-xl border border-[#DADADA] text-muted hover:border-[#2E7D6B] hover:text-[#2E7D6B] transition-all">
            Register Node
          </Link>
        </motion.div>
        <motion.div className="w-px h-16 bg-[#DADADA] mx-auto mt-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: active ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 1.3 }} style={{ originY: 0 }} />
        <motion.p className="font-mono text-[9px] mt-4" style={{ color: 'rgba(17,17,17,0.28)' }}
          initial={{ opacity: 0 }} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.5 }}>
          ERC-8004 · Base Mainnet ·{' '}
          <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
            target="_blank" rel="noopener" className="underline hover:text-[#2E7D6B] transition-colors">0xb8623d...cf43a</a>
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
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd) }
  }, [advance])

  const dark = SECTIONS[section].darkBg

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#F7F7F7' }}>
      <NavBar dark={dark} />
      <motion.div style={{ display: 'flex', width: `${N * 100}vw`, height: '100vh' }}
        animate={{ x: `${-section * 100}vw` }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><IntroPlane active={section === 0} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><SystemPlane active={section === 1} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><IntelligencePlane active={section === 2} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><WhatPlane active={section === 3} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><NetworkPlane active={section === 4} /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EconomicsPlane /></div>
        <div style={{ width: '100vw', height: '100vh', flexShrink: 0 }}><EnterPlane active={section === 6} /></div>
      </motion.div>
      <Progress section={section} setSection={setSection} dark={dark} />
      <NavArrows section={section} setSection={setSection} dark={dark} />
    </div>
  )
}
