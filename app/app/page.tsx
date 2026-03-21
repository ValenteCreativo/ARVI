'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

// ─── Cursor tracker ────────────────────────────────────────────────────────────
function useCursor() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 80, damping: 20 })
  const sy = useSpring(y, { stiffness: 80, damping: 20 })
  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])
  return { x: sx, y: sy, rawX: x, rawY: y }
}

// ─── Animated network background ──────────────────────────────────────────────
function NetworkBg() {
  const DOTS = [
    [12,8],[28,15],[45,9],[62,18],[80,12],[92,20],
    [8,35],[22,42],[38,30],[55,38],[72,25],[88,35],
    [15,55],[32,62],[50,52],[68,60],[85,50],[95,65],
    [5,75],[20,82],[42,72],[60,78],[78,70],[90,80],
    [18,92],[35,88],[55,95],[75,85],[88,92],
  ]
  const LINES = [[0,3],[1,4],[2,5],[3,7],[4,8],[5,9],[6,10],[7,11],[8,12],[9,13],[10,14],[11,15],[12,16],[13,17],[14,18],[15,19],[16,20],[17,21],[18,22],[19,23],[20,24],[21,25],[22,26],[23,27],[1,8],[4,9],[7,12],[10,15],[13,18],[16,21]]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      {LINES.map(([a, b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return (
          <motion.line key={i}
            x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`}
            x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
            stroke="#DADADA" strokeWidth="0.8"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.5, 0.3] }}
            transition={{ duration: 2, delay: i * 0.06, ease: 'easeOut' }}
          />
        )
      })}
      {DOTS.map(([cx, cy], i) => (
        <motion.circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="2.5"
          fill="none" stroke="#DADADA" strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ delay: i * 0.04 + 0.5, duration: 0.4 }}
        />
      ))}
      {/* Animated signal lines */}
      {[[0,4],[3,8],[9,13],[14,18],[19,23]].map(([a, b], i) => {
        if (!DOTS[a] || !DOTS[b]) return null
        return (
          <motion.line key={`s${i}`}
            x1={`${DOTS[a][0]}%`} y1={`${DOTS[a][1]}%`}
            x2={`${DOTS[b][0]}%`} y2={`${DOTS[b][1]}%`}
            stroke="#2E7D6B" strokeWidth="1" strokeDasharray="4 8"
            animate={{ strokeDashoffset: [0, -36] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 1.2 }}
          />
        )
      })}
    </svg>
  )
}

// ─── Section 1: Opening ────────────────────────────────────────────────────────
function Opening() {
  const [ready, setReady] = useState(false)
  useEffect(() => { setTimeout(() => setReady(true), 200) }, [])
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-canvas">
      <NetworkBg />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-12">
            Environmental Intelligence
          </p>
        </motion.div>
        <motion.h1 className="font-serif text-[80px] sm:text-[120px] lg:text-[160px] leading-none text-ink mb-8 tracking-tight"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          ARVI
        </motion.h1>
        <motion.p className="font-mono text-sm text-muted mb-2 tracking-wide"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
          in motion.
        </motion.p>
        <motion.p className="font-mono text-[11px] text-muted/60 tracking-widest"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}>
          A system that listens, learns, and responds.
        </motion.p>
        <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
          <motion.div className="w-px h-12 bg-border"
            animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="font-mono text-[9px] text-muted/40 tracking-widest">scroll</span>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section 2: First Signal (cursor-reactive) ────────────────────────────────
function FirstSignal() {
  const { rawX, rawY } = useCursor()
  const ref = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; active: boolean }>>([])
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setNodes(Array.from({ length: 12 }, (_, i) => ({
      x: 8 + (i % 4) * 28 + (Math.floor(i / 4) % 2) * 14,
      y: 20 + Math.floor(i / 4) * 30,
      active: false,
    })))
  }, [])

  useEffect(() => {
    const unsub = rawX.on('change', () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const lx = (rawX.get() - rect.left) / rect.width * 100
      const ly = (rawY.get() - rect.top) / rect.height * 100
      setNodes(prev => prev.map(n => ({
        ...n,
        active: Math.hypot(n.x - lx, n.y - ly) < 15,
      })))
      const anyActive = nodes.some(n => Math.hypot(n.x - lx, n.y - ly) < 15)
      if (anyActive) setRevealed(true)
    })
    return () => unsub()
  }, [rawX, rawY, nodes])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center bg-canvas cursor-zone overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />

      {/* Reactive nodes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.map((n, i) => (
          <g key={i}>
            <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r="4"
              fill={n.active ? '#EAF4F1' : 'white'}
              stroke={n.active ? '#2E7D6B' : '#DADADA'}
              strokeWidth={n.active ? '1.5' : '1'}
              animate={{ r: n.active ? 7 : 4, opacity: n.active ? 1 : 0.7 }}
              transition={{ duration: 0.2 }}
            />
            {n.active && (
              <motion.circle cx={`${n.x}%`} cy={`${n.y}%`} r="12"
                fill="none" stroke="#2E7D6B" strokeWidth="0.5"
                initial={{ r: 7, opacity: 0.8 }} animate={{ r: 22, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </g>
        ))}
      </svg>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.p className="font-mono text-[10px] text-muted/40 tracking-widest uppercase mb-16"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          move your cursor
        </motion.p>
        <AnimatePresence>
          {revealed ? (
            <motion.div key="revealed"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}>
              <h2 className="font-serif text-5xl lg:text-6xl text-ink mb-6">
                Intelligence is not.
              </h2>
              <p className="font-mono text-sm text-muted">Data is everywhere.</p>
            </motion.div>
          ) : (
            <motion.div key="waiting" initial={{ opacity: 0.6 }} exit={{ opacity: 0 }}>
              <h2 className="font-serif text-5xl lg:text-6xl text-border">
                Data is everywhere.
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── Section 3: Core Reveal ────────────────────────────────────────────────────
function CoreReveal() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-canvas px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="w-px h-20 bg-border mx-auto mb-16" />
        </motion.div>
        <motion.h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-tight mb-10"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          ARVI is an autonomous intelligence layer
          <br /><span className="text-jade">that transforms environmental signals</span>
          <br />into actionable systems.
        </motion.h2>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }}>
          <p className="font-mono text-[11px] text-muted tracking-[0.2em] uppercase">
            sensing &nbsp;—&nbsp; understanding &nbsp;—&nbsp; action
          </p>
        </motion.div>
        <div className="w-px h-20 bg-border mx-auto mt-16" />
      </div>
    </section>
  )
}

// ─── Section 4: System View (Interactive Node Graph) ─────────────────────────
const SYSTEM_NODES = [
  { id: 'sensor',  x: 12,  y: 50, label: 'Sensor Node',      micro: 'Collects real-world signals.\nTree-level. Not city averages.',     sym: '○' },
  { id: 'data',    x: 32,  y: 28, label: 'Data Layer',        micro: 'Hyperlocal streams.\nSoil, air, biodiversity, pathogen risk.', sym: '—' },
  { id: 'agent',   x: 52,  y: 50, label: 'Intelligence Agent',micro: 'Interprets and reacts\nin real-time. No human in the loop.',    sym: '◈' },
  { id: 'network', x: 72,  y: 28, label: 'Network',           micro: 'Coordinates intelligence\nacross ecosystems and regions.',        sym: '⬡' },
  { id: 'action',  x: 88,  y: 50, label: 'Action Layer',      micro: 'Alerts logged onchain.\nOperators paid automatically.',           sym: '▸' },
]

const SYSTEM_EDGES = [
  ['sensor', 'data'], ['sensor', 'agent'],
  ['data', 'agent'],  ['agent', 'network'],
  ['agent', 'action'],['network', 'action'],
]

function SystemView() {
  const [active, setActive] = useState<string | null>(null)
  const nodeMap = Object.fromEntries(SYSTEM_NODES.map(n => [n.id, n]))

  return (
    <section className="relative min-h-screen bg-canvas flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
      <div className="grid-bg-sm absolute inset-0 opacity-30" />
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-4">The System</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-ink">Click any node.</h2>
        </div>

        {/* SVG Graph */}
        <div className="relative w-full" style={{ paddingBottom: '38%' }}>
          <svg className="absolute inset-0 w-full h-full overflow-visible">
            {/* Edges */}
            {SYSTEM_EDGES.map(([a, b]) => {
              const na = nodeMap[a]; const nb = nodeMap[b]
              const isActive = active === a || active === b
              return (
                <motion.line key={`${a}-${b}`}
                  x1={`${na.x}%`} y1={`${na.y}%`}
                  x2={`${nb.x}%`} y2={`${nb.y}%`}
                  stroke={isActive ? '#2E7D6B' : '#DADADA'}
                  strokeWidth={isActive ? '1.5' : '1'}
                  strokeDasharray={isActive ? '4 6' : 'none'}
                  animate={isActive ? { strokeDashoffset: [0, -20] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              )
            })}
            {/* Nodes */}
            {SYSTEM_NODES.map(node => {
              const isActive = active === node.id
              return (
                <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => setActive(isActive ? null : node.id)}>
                  <motion.circle
                    cx={`${node.x}%`} cy={`${node.y}%`}
                    r={isActive ? '20' : '14'}
                    fill={isActive ? '#EAF4F1' : 'white'}
                    stroke={isActive ? '#2E7D6B' : '#DADADA'}
                    strokeWidth={isActive ? '1.5' : '1'}
                    animate={{ r: isActive ? 20 : 14 }}
                    transition={{ duration: 0.25 }}
                  />
                  {isActive && (
                    <motion.circle cx={`${node.x}%`} cy={`${node.y}%`} r="28"
                      fill="none" stroke="#2E7D6B" strokeWidth="0.5"
                      initial={{ opacity: 0.5, r: 20 }} animate={{ opacity: 0, r: 38 }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                  <text
                    x={`${node.x}%`} y={`${node.y}%`}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={isActive ? '#2E7D6B' : '#888888'}
                    style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', pointerEvents: 'none', userSelect: 'none' }}>
                    {node.sym}
                  </text>
                  <text
                    x={`${node.x}%`} y={`${node.y + 9}%`}
                    textAnchor="middle"
                    fill={isActive ? '#111111' : '#888888'}
                    style={{ fontSize: '9px', fontFamily: 'DM Mono, monospace', pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {node.label.split(' ')[0]}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Micro-copy reveal */}
        <div className="mt-8 h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div key={active}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-center">
                <p className="font-mono text-[11px] text-muted tracking-[0.3em] uppercase mb-1">{nodeMap[active]?.label}</p>
                <p className="font-serif text-xl text-ink whitespace-pre-line">{nodeMap[active]?.micro.replace(/\n/g, ' ')}</p>
              </motion.div>
            )}
            {!active && (
              <motion.p key="idle" className="font-mono text-[10px] text-muted/40 tracking-widest"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                — select a node to reveal its role —
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

// ─── Section 5: Use Case as Experience ─────────────────────────────────────────
const USE_CASES = [
  {
    id: 'water',
    label: 'Water',
    sym: '○',
    signal: 'pH anomaly detected.',
    action: 'A river changes. ARVI detects. Agents respond.',
    micro: 'Sensor reads pH 5.8 — below safe threshold. Agent confirms industrial runoff pattern. Action triggered: water authority alerted + operator paid.',
  },
  {
    id: 'forest',
    label: 'Forest',
    sym: '◎',
    signal: 'Pathogen risk: 89%.',
    action: 'A canopy shows stress. ARVI classifies. Response deploys.',
    micro: '47 Ahuehuete trees under plague threat. Biodiversity score collapsed to 31%. Phytosanitary team dispatched — 8.5 USDC paid to node operator.',
  },
  {
    id: 'soil',
    label: 'Soil',
    sym: '▸',
    signal: 'Carbon sequestration falling.',
    action: 'The soil speaks. ARVI listens. The record is permanent.',
    micro: 'Root zone moisture at 18% — drought stress confirmed. CO₂ absorption model shows −22% vs baseline. Alert logged onchain.',
  },
  {
    id: 'air',
    label: 'Air',
    sym: '◈',
    signal: 'AQI 112 — unhealthy zone.',
    action: 'Invisible signals become visible decisions.',
    micro: 'PM2.5 spike at canopy level — not visible in city averages. Cross-reference with wind data confirms industrial source. Municipality notified.',
  },
]

function UseCaseSection() {
  const [active, setActive] = useState<typeof USE_CASES[0]>(USE_CASES[1])

  return (
    <section className="relative min-h-screen bg-canvas flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-4">Use cases</p>
          <h2 className="font-serif text-4xl text-ink">Select an ecosystem.</h2>
        </div>
        {/* Selector */}
        <div className="flex justify-center gap-2 mb-16">
          {USE_CASES.map(uc => (
            <button key={uc.id} onClick={() => setActive(uc)}
              className={`font-mono text-xs px-5 py-2.5 rounded-lg border transition-all ${active.id === uc.id ? 'border-jade bg-jade-light text-jade' : 'border-border text-muted hover:border-jade/40 hover:text-ink'}`}>
              {uc.sym} {uc.label}
            </button>
          ))}
        </div>

        {/* Experience */}
        <AnimatePresence mode="wait">
          <motion.div key={active.id}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto">
            {/* Signal */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <motion.div className="w-2 h-2 rounded-full bg-jade"
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
              <p className="font-mono text-xs text-jade tracking-widest">{active.signal}</p>
            </div>
            {/* Main copy */}
            <h3 className="font-serif text-4xl lg:text-5xl text-ink text-center leading-tight mb-8">
              {active.action}
            </h3>
            {/* Detail */}
            <div className="border border-line rounded-xl p-6 bg-white">
              <p className="font-mono text-[10px] text-muted tracking-widest uppercase mb-3">What happens</p>
              <p className="text-ink/70 text-sm leading-relaxed">{active.micro}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

// ─── Section 6: Closing statement ─────────────────────────────────────────────
function ClosingStatement() {
  return (
    <section className="relative min-h-[50vh] bg-canvas flex items-center justify-center px-6">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-px h-20 bg-border mx-auto mb-16" />
        <motion.h2 className="font-serif text-4xl lg:text-5xl text-ink leading-tight"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          ARVI is not a dashboard.
          <br /><span className="text-jade">It&apos;s an intelligence system.</span>
        </motion.h2>
        <div className="w-px h-20 bg-border mx-auto mt-16" />
      </div>
    </section>
  )
}

// ─── Section 7: Business Model ─────────────────────────────────────────────────
function BizModel() {
  return (
    <section className="bg-canvas px-6 py-24 border-t border-line">
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <p className="font-mono text-[10px] text-muted tracking-[0.4em] uppercase mb-4">Economics</p>
          <h2 className="font-serif text-4xl text-ink">Self-sustaining,<br />not grant-dependent.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { sym: '○', label: 'Node Subscriptions', val: '$1,200/node/yr', desc: 'Hardware + verified data per sensor' },
            { sym: '◈', label: 'Enterprise Data API',  val: '$500/mo',       desc: 'Municipalities buy ecosystem feeds' },
            { sym: '▸', label: 'Alert Intelligence',   val: '$2,000/mo',     desc: 'AI-classified alerts + recommendations' },
            { sym: '⬡', label: 'Carbon Oracle',        val: '$0.80/tonne',   desc: 'Onchain proof of carbon absorption' },
          ].map(s => (
            <motion.div key={s.label} whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 12 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              className="panel p-5 hover:border-jade/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-jade text-sm">{s.sym}</span>
                <span className="font-mono text-[11px] text-jade">{s.val}</span>
              </div>
              <p className="font-mono text-[10px] text-ink/70 mb-1">{s.label}</p>
              <p className="text-xs text-muted">{s.desc}</p>
            </motion.div>
          ))}
        </div>
        {/* Growth table */}
        <div className="panel overflow-hidden mb-10">
          <div className="panel-header">3-Year Growth Projection</div>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-line">
              {['Period','Nodes','Trees Protected','Revenue'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mono text-[10px] text-muted uppercase tracking-widest">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[['Year 1','50','14K','$42K'],['Year 2','250','70K','$280K'],['Year 3','1,000','280K','$1.4M']].map((row, i) => (
                <tr key={row[0]} className={`border-b border-line ${i === 2 ? 'bg-jade-light' : ''}`}>
                  <td className="px-5 py-4 font-mono text-muted">{row[0]}</td>
                  <td className="px-5 py-4 font-mono font-bold text-jade">{row[1]}</td>
                  <td className="px-5 py-4 font-mono text-ink/50">{row[2]}</td>
                  <td className="px-5 py-4 font-mono font-bold text-jade">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Public goods */}
        <div className="border border-jade/20 rounded-xl bg-jade-light p-6">
          <p className="font-mono text-[10px] text-jade tracking-widest uppercase mb-5">Public Goods Impact — Year 3</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['432K','Sensor readings/yr'],['$720K','Paid to operators'],['280K','Trees protected'],['1K','Community nodes']].map(([v,l]) => (
              <div key={l}>
                <div className="font-serif text-3xl text-jade mb-1">{v}</div>
                <div className="font-mono text-[10px] text-jade/70">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="bg-ink px-6 py-24 text-center">
      <div className="max-w-xl mx-auto">
        <motion.h2 className="font-serif text-4xl lg:text-5xl text-white leading-tight mb-6"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Enter the system.
        </motion.h2>
        <p className="font-mono text-[11px] text-white/30 tracking-wide mb-12">
          The planet generates data. ARVI acts on it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-jade">Launch App ▸</Link>
          <Link href="/atlas" className="btn-outline" style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
            ○ View Atlas
          </Link>
          <Link href="/register" className="btn-outline" style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
            Register a Node
          </Link>
        </div>
        <p className="font-mono text-[9px] text-white/15 mt-10">
          ERC-8004 · Base Mainnet · <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
            target="_blank" rel="noopener" className="underline hover:text-jade/40">0xb8623d...cf43a</a> · Pantera Labs 2026
        </p>
      </div>
    </section>
  )
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const { scrollYProgress } = useScroll()
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const unsub = scrollYProgress.on('change', v => setScrolled(v > 0.02))
    return () => unsub()
  }, [scrollYProgress])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-canvas/95 backdrop-blur-sm border-b border-line' : 'bg-transparent'}`}>
      {/* Progress bar */}
      <motion.div className="absolute bottom-0 left-0 h-px bg-jade origin-left" style={{ width: progress }} />
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-jade/30 bg-jade-light flex items-center justify-center font-mono text-jade text-xs">◈</div>
          <span className="font-mono text-sm text-ink">ARVI</span>
          <span className="hidden sm:block font-mono text-[9px] border border-border px-2 py-0.5 rounded text-muted">v4.0</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/atlas" className="font-mono text-[11px] text-muted hover:text-ink transition-colors hidden sm:block">Atlas</Link>
          <Link href="/dashboard" className="font-mono text-[11px] px-4 py-2 rounded-lg border border-jade/30 bg-jade-light text-jade hover:bg-jade/10 transition-all">
            Launch App ▸
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-ink border-t border-white/5 px-6 py-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-white/20">
        <span>ARVI — Agentic Regeneration Via Intelligence</span>
        <div className="flex items-center gap-6">
          {[['GitHub','https://github.com/ValenteCreativo/ARVI'],['Atlas','/atlas'],['App','/dashboard'],['Register','/register']].map(([l, h]) => (
            h.startsWith('http')
              ? <a key={l} href={h} target="_blank" rel="noopener" className="hover:text-white/40 transition-colors">{l}</a>
              : <Link key={l} href={h} className="hover:text-white/40 transition-colors">{l}</Link>
          ))}
        </div>
        <span>Pantera Labs · 2026</span>
      </div>
    </footer>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <main className="bg-canvas">
      <Nav />
      <Opening />
      <FirstSignal />
      <CoreReveal />
      <SystemView />
      <UseCaseSection />
      <ClosingStatement />
      <BizModel />
      <CTA />
      <Footer />
    </main>
  )
}
