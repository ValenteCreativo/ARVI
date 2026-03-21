'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

// ─── Ecosystem chips ────────────────────────────────────────────────────────
const ECOSYSTEMS = [
  { id: 'forests',    label: 'urban forests',     accent: '#5CFFD0' },
  { id: 'aquatic',    label: 'aquatic systems',    accent: '#60C8FF' },
  { id: 'coral',      label: 'coral reefs',        accent: '#FF9F5C' },
  { id: 'soil',       label: 'soil microbiomes',   accent: '#FFC64D' },
  { id: 'fauna',      label: 'fauna corridors',    accent: '#C084FC' },
  { id: 'wetlands',   label: 'wetlands',           accent: '#5CFFD0' },
  { id: 'atmosphere', label: 'the atmosphere',     accent: '#94A3B8' },
]

// ─── Agent data cards per section ────────────────────────────────────────────
const SECTION_DATA = [
  null, // void — no data card
  {
    node: 'n1.arvi.eth', location: 'Bosque de Chapultepec, CDMX',
    metric: 'Health Score', value: '34%', status: 'CRITICAL',
    alert: 'Probable plague — Ahuehuete sp.',
    action: '▸ Agent deployed in 1.8s',
    color: '#FF5C3A',
  },
  {
    node: 'node-aqua-07', location: 'Lago de Chapultepec, CDMX',
    metric: 'pH Level', value: '6.1', status: 'CRITICAL',
    alert: 'Below EPA threshold — aquatic life at risk',
    action: '▸ Alert issued · 12 USDC → operator',
    color: '#60C8FF',
  },
  {
    node: 'soil-mx-003', location: 'Milpa Alta Volcanic Soil, CDMX',
    metric: 'Carbon Seq.', value: '−18%', status: 'WARNING',
    alert: 'Sequestration anomaly — erosion pattern',
    action: '▸ Pattern logged · Intervention queued',
    color: '#FFC64D',
  },
  {
    node: 'fauna-mx-12', location: 'Corredor Biológico Central MX',
    metric: 'Species Active', value: '61 / 97', status: 'WARNING',
    alert: 'Migration disruption — thermal anomaly',
    action: '▸ Alert sent to conservation authority',
    color: '#C084FC',
  },
  null, // atmosphere — global stats
]

const SECTION_COUNT = 6

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ scrollProgress }: { scrollProgress: number }) {
  const section = Math.round(scrollProgress * (SECTION_COUNT - 1))
  const labels = ['Awakening', 'Urban Forests', 'Aquatic', 'Soil', 'Fauna', 'Network']

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-void/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-aqua/30 bg-aqua/10 flex items-center justify-center">
            <span className="text-aqua text-xs font-mono">◈</span>
          </div>
          <span className="font-mono text-sm text-parchment tracking-wide">ARVI</span>
          <span className="hidden sm:block text-[10px] font-mono border border-white/10 px-2 py-0.5 rounded text-white/30">
            v3.0 · Base Mainnet
          </span>
        </div>

        {/* Section indicator */}
        <div className="hidden md:flex items-center gap-1">
          {labels.map((l, i) => (
            <button
              key={l}
              onClick={() => {
                const el = document.getElementById('horizontal-world')
                if (!el) return
                const scrollTarget = (i / (SECTION_COUNT - 1)) * (el.scrollHeight - window.innerHeight)
                window.scrollTo({ top: el.offsetTop + scrollTarget, behavior: 'smooth' })
              }}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-all ${
                i === section
                  ? 'text-aqua border border-aqua/30 bg-aqua/5'
                  : 'text-white/25 hover:text-white/50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/atlas" className="text-[11px] font-mono text-white/35 hover:text-white/60 transition-colors hidden sm:block">
            Atlas
          </Link>
          <Link href="/dashboard" className="text-[11px] font-mono px-4 py-2 rounded border border-aqua/30 bg-aqua/5 text-aqua hover:bg-aqua/10 transition-all">
            Launch App ▸
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Fill-in-blank hero (Section 0) ──────────────────────────────────────────
function Section0({ activeEco, setActiveEco }: {
  activeEco: typeof ECOSYSTEMS[0]
  setActiveEco: (e: typeof ECOSYSTEMS[0]) => void
}) {
  return (
    <section className="relative w-screen h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      {/* Star field */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5 + 0.1,
          }}
        />
      ))}

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(92,255,208,1) 1px, transparent 1px), linear-gradient(90deg, rgba(92,255,208,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="relative text-center max-w-5xl mx-auto">
        <p className="section-label mb-8 tracking-[0.4em]">
          ◎ ARVI — Agentic Regeneration Via Intelligence
        </p>

        {/* The headline */}
        <h1 className="font-serif leading-none mb-4">
          <span className="block text-5xl sm:text-7xl lg:text-8xl text-parchment mb-3">
            Agentic intelligence
          </span>
          <span className="block text-4xl sm:text-6xl lg:text-7xl text-parchment/60 mb-3">
            for the
          </span>
          {/* The fill-in slot */}
          <span className="block">
            <AnimatePresence mode="wait">
              <motion.span
                key={activeEco.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="inline-block text-4xl sm:text-6xl lg:text-7xl font-serif italic border-b-2 pb-1 cursor-pointer"
                style={{ color: activeEco.accent, borderColor: activeEco.accent + '60' }}
              >
                {activeEco.label}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="block text-3xl sm:text-5xl lg:text-6xl text-parchment/60 mt-3">
            that makes our planet livable.
          </span>
        </h1>

        {/* Ecosystem chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-10 mb-8">
          {ECOSYSTEMS.map(eco => (
            <motion.button
              key={eco.id}
              onClick={() => setActiveEco(eco)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
                activeEco.id === eco.id
                  ? 'text-void font-bold'
                  : 'text-white/40 border-white/10 hover:text-white/70 hover:border-white/20'
              }`}
              style={activeEco.id === eco.id ? {
                background: eco.accent,
                borderColor: eco.accent,
                color: '#0A0B14',
              } : {}}
            >
              {eco.label}
            </motion.button>
          ))}
        </div>

        <p className="text-sm text-white/25 font-mono max-w-lg mx-auto">
          — select an ecosystem above, or watch the agent choose —
        </p>

        {/* Scroll indicator */}
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-8 bottom-8 text-white/20 font-mono text-xs flex items-center gap-2"
        >
          scroll to traverse ——▸
        </motion.div>
      </div>
    </section>
  )
}

// ─── Data section (sections 1–4) ─────────────────────────────────────────────
function DataSection({ idx, bgColor, title, subtitle, quote, data }: {
  idx: number
  bgColor: string
  title: string
  subtitle: string
  quote: string
  data: typeof SECTION_DATA[1]
}) {
  return (
    <section
      className="relative w-screen h-screen flex items-center justify-center px-12 overflow-hidden"
      style={{ background: bgColor }}
    >
      {/* Decorative vertical lines (trees / reeds / roots / paths) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0"
            style={{
              left: `${8 + i * 12}%`,
              width: '1px',
              background: `linear-gradient(to bottom, transparent, ${data?.color || '#5CFFD0'}08, transparent)`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left — text */}
        <div>
          <p className="section-label mb-6 tracking-[0.3em]">◈ ECOSYSTEM {String(idx).padStart(2, '0')}</p>
          <h2 className="font-serif text-5xl lg:text-6xl text-parchment leading-tight mb-4">
            {title}
          </h2>
          <p className="text-parchment/40 text-lg leading-relaxed mb-8 font-sans">{subtitle}</p>
          <blockquote className="border-l-2 pl-5 text-sm font-mono italic text-white/30" style={{ borderColor: data?.color || '#5CFFD0' }}>
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>

        {/* Right — telemetry card */}
        {data && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: `${data.color}06`,
              border: `1px solid ${data.color}25`,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-mono text-[10px] text-white/30 tracking-widest uppercase mb-1">Node</p>
                <p className="font-mono text-sm" style={{ color: data.color }}>{data.node}</p>
              </div>
              <span
                className="text-[10px] font-mono font-bold px-3 py-1 rounded-full"
                style={{
                  background: `${data.color}15`,
                  border: `1px solid ${data.color}30`,
                  color: data.color,
                }}
              >
                {data.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white/25 mb-1">{data.metric}</p>
                <p className="text-3xl font-mono font-bold" style={{ color: data.color }}>{data.value}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-[10px] font-mono text-white/25 mb-1">Location</p>
                <p className="text-xs font-mono text-white/50 leading-snug">{data.location}</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-4 mb-3">
              <p className="text-[10px] font-mono text-white/25 mb-2 uppercase tracking-wider">Agent Detection</p>
              <p className="text-sm text-white/60 font-mono">{data.alert}</p>
            </div>

            <div
              className="rounded-xl p-3 text-sm font-mono"
              style={{ background: `${data.color}10`, color: data.color }}
            >
              {data.action}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Final section — Network overview ────────────────────────────────────────
function Section5() {
  const stats = [
    { value: '5', label: 'ecosystem types', sub: 'currently monitored' },
    { value: '< 2s', label: 'detection latency', sub: 'anomaly to action' },
    { value: '0', label: 'human approvals', sub: 'required to act' },
    { value: '∞', label: 'scalability', sub: 'any node, any biome' },
  ]

  return (
    <section className="relative w-screen h-screen flex flex-col items-center justify-center px-12 overflow-hidden" style={{ background: '#070810' }}>
      {/* Star field fades back in */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white/15"
          style={{ width: 2, height: 2, left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: Math.random() * 0.4 + 0.1 }} />
      ))}

      <div className="relative text-center max-w-4xl">
        <p className="section-label mb-8 tracking-[0.4em]">⬡ THE NETWORK</p>

        <h2 className="font-serif text-5xl lg:text-7xl text-parchment mb-6 leading-tight">
          The planet grows.
          <br />
          <span className="text-aqua">The network responds.</span>
        </h2>

        <p className="text-parchment/40 text-lg max-w-xl mx-auto mb-12 font-sans leading-relaxed">
          One agent architecture. Every ecosystem. Autonomous execution. Verifiable onchain proof of every action.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-center hover:border-aqua/20 transition-all">
              <div className="font-serif text-4xl text-aqua mb-1">{s.value}</div>
              <div className="text-xs font-mono text-parchment/60">{s.label}</div>
              <div className="text-[10px] font-mono text-white/20 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard"
            className="px-8 py-4 rounded-xl font-mono text-sm font-bold text-void bg-aqua hover:bg-aqua/90 transition-all"
            style={{ boxShadow: '0 0 40px rgba(92,255,208,0.2)' }}>
            Launch App ▸
          </Link>
          <Link href="/atlas"
            className="px-8 py-4 rounded-xl border border-white/10 text-parchment/60 font-mono text-sm hover:border-white/20 hover:text-parchment/80 transition-all">
            ◎ View Atlas
          </Link>
          <Link href="/register"
            className="px-8 py-4 rounded-xl border border-white/10 text-parchment/60 font-mono text-sm hover:border-white/20 hover:text-parchment/80 transition-all">
            Register a Node
          </Link>
        </div>

        <p className="mt-8 text-[10px] font-mono text-white/15">
          ERC-8004 Identity ·{' '}
          <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a" target="_blank" rel="noopener" className="underline hover:text-aqua/30">
            0xb8623d...cf43a
          </a>
          {' '}· Base Mainnet · Pantera Labs 2026
        </p>
      </div>
    </section>
  )
}

// ─── Business Model (vertical, after scroll) ─────────────────────────────────
function BusinessModel() {
  const streams = [
    { sym: '◎', label: 'Node Operator Subscriptions', desc: 'Annual hardware + data access per deployed sensor node', val: '$1,200/node/yr' },
    { sym: '◈', label: 'Enterprise Intelligence API', desc: 'Municipalities, researchers, NGOs subscribe to verified ecosystem feeds', val: '$500/mo' },
    { sym: '▸', label: 'Alert Intelligence', desc: 'Real-time AI-classified alerts with intervention recommendations', val: '$2,000/mo' },
    { sym: '⬡', label: 'Carbon Verification Oracle', desc: 'Onchain proof of carbon absorption for verified ecosystem preservation', val: '$0.80/tonne' },
  ]

  const projections = [
    { period: 'Year 1', nodes: '50',  trees: '14K', revenue: '$42K' },
    { period: 'Year 2', nodes: '250', trees: '70K', revenue: '$280K' },
    { period: 'Year 3', nodes: '1K',  trees: '280K', revenue: '$1.4M' },
  ]

  return (
    <section className="px-6 py-32 border-t border-white/5 bg-void">
      <div className="max-w-5xl mx-auto">
        <p className="section-label mb-6 tracking-[0.3em]">— BUSINESS MODEL</p>
        <h2 className="font-serif text-4xl lg:text-5xl text-parchment mb-4">
          Sustainable infrastructure,
          <br /><span className="text-aqua">not charity.</span>
        </h2>
        <p className="text-parchment/35 mb-16 max-w-xl font-sans leading-relaxed">
          Every participant is economically incentivized. No grants required. The agent pays for itself.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {streams.map(s => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-surface p-6 hover:border-aqua/15 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-aqua font-mono text-lg">{s.sym}</span>
                  <span className="font-mono text-sm text-parchment/80 font-medium">{s.label}</span>
                </div>
                <span className="font-mono text-sm text-aqua">{s.val}</span>
              </div>
              <p className="text-xs text-parchment/35 font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden mb-12">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="font-mono text-sm text-parchment/70">Growth Projections</span>
            <span className="text-[10px] font-mono text-white/20">Conservative · 3yr horizon</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Period','Nodes','Trees Monitored','Total Revenue'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-mono text-[10px] text-white/25 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projections.map((r, i) => (
                <tr key={r.period} className={`border-b border-white/5 ${i === 2 ? 'bg-aqua/5' : ''}`}>
                  <td className="px-6 py-4 font-mono text-parchment/60">{r.period}</td>
                  <td className="px-6 py-4 font-mono text-aqua font-bold">{r.nodes}</td>
                  <td className="px-6 py-4 font-mono text-parchment/40">{r.trees}</td>
                  <td className="px-6 py-4 font-mono text-aqua font-bold">{r.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Octant KPIs */}
        <div className="rounded-2xl border border-solar/20 bg-solar/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-solar text-sm">⬡ Public Goods Metrics</span>
            <span className="font-mono text-[10px] text-white/20 ml-auto">Octant track · Year 3 at scale</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { v: '432K', l: 'Data readings/yr' },
              { v: '$720K', l: 'Paid to operators' },
              { v: '280K', l: 'Trees protected' },
              { v: '1K', l: 'Community nodes' },
            ].map(m => (
              <div key={m.l}>
                <div className="font-serif text-3xl text-solar mb-1">{m.v}</div>
                <div className="text-[10px] font-mono text-parchment/40">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8 bg-void">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-white/20">
        <span>ARVI — Agentic Regeneration Via Intelligence</span>
        <div className="flex items-center gap-6">
          <a href="https://github.com/ValenteCreativo/ARVI" target="_blank" rel="noopener" className="hover:text-white/40 transition-colors">GitHub</a>
          <Link href="/atlas" className="hover:text-white/40 transition-colors">Atlas</Link>
          <Link href="/dashboard" className="hover:text-white/40 transition-colors">App</Link>
          <Link href="/register" className="hover:text-white/40 transition-colors">Register</Link>
        </div>
        <span>Pantera Labs · 2026</span>
      </div>
    </footer>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SECTION_CONFIGS = [
  null, // section 0 handled by Section0
  {
    bgColor: '#060D0A',
    title: 'Urban Forests.',
    subtitle: 'Millions of trees absorbing carbon, cooling streets, filtering air — dying without a single alert sent in time.',
    quote: '47 Ahuehuete trees in Chapultepec. Plague detected. Agent deployed. 1.8 seconds.',
  },
  {
    bgColor: '#060810',
    title: 'Aquatic Systems.',
    subtitle: 'Water quality changes in hours. Human monitoring cycles in weeks. The gap is where ecosystems collapse.',
    quote: 'pH 6.2. Below EPA threshold. No human was called. The agent already acted.',
  },
  {
    bgColor: '#0F0A06',
    title: 'Soil Microbiomes.',
    subtitle: 'Below our feet: the carbon engine of the planet. Invisible, unmeasured, unprotected.',
    quote: 'Carbon sequestration down 18%. Pattern flagged. Intervention queued. Zero meetings held.',
  },
  {
    bgColor: '#070810',
    title: 'Fauna Corridors.',
    subtitle: 'Migration routes disrupted by heat anomalies. Wildlife data exists. No one is connecting the dots.',
    quote: '36 species off-route. Thermal anomaly confirmed. Conservation authority alerted automatically.',
  },
]

export default function Landing() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(SECTION_COUNT - 1) * 100}vw`])

  const [scrollProg, setScrollProg] = useState(0)
  const [activeEco, setActiveEco] = useState(ECOSYSTEMS[0])

  // Track scroll for nav
  useEffect(() => {
    return scrollYProgress.on('change', v => setScrollProg(v))
  }, [scrollYProgress])

  // Auto-cycle ecosystems (the agent choosing autonomously)
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i = (i + 1) % ECOSYSTEMS.length
      setActiveEco(ECOSYSTEMS[i])
    }, 2800)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-void min-h-screen">
      <Nav scrollProgress={scrollProg} />

      {/* ─── Horizontal Panorama ─── */}
      <div
        id="horizontal-world"
        ref={scrollRef}
        style={{ height: `${SECTION_COUNT * 100}vh` }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div
            style={{ x, display: 'flex', width: `${SECTION_COUNT * 100}vw`, height: '100vh' }}
          >
            {/* S0: Awakening */}
            <Section0 activeEco={activeEco} setActiveEco={setActiveEco} />

            {/* S1–S4: Ecosystems */}
            {SECTION_CONFIGS.slice(1).map((cfg, i) =>
              cfg ? (
                <DataSection
                  key={i}
                  idx={i + 1}
                  bgColor={cfg.bgColor}
                  title={cfg.title}
                  subtitle={cfg.subtitle}
                  quote={cfg.quote}
                  data={SECTION_DATA[i + 1]}
                />
              ) : null
            )}

            {/* S5: Network */}
            <Section5 />
          </motion.div>
        </div>
      </div>

      {/* ─── After scroll: Business model + footer (vertical) ─── */}
      <BusinessModel />
      <Footer />
    </div>
  )
}
