'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const MiniWorldMap = dynamic(() => import('./components/MiniWorldMap'), { ssr: false, loading: () => (
  <div className="w-full h-full rounded-2xl border border-white/10 bg-surface flex items-center justify-center">
    <span className="font-mono text-[10px] text-white/20 animate-pulse">loading map...</span>
  </div>
)})

// ─── Ecosystems ───────────────────────────────────────────────────────────────
const ECOSYSTEMS = [
  { id: 'forests',    label: 'urban forests',     accent: '#5CFFD0', sym: '◎' },
  { id: 'aquatic',    label: 'aquatic systems',    accent: '#60C8FF', sym: '◈' },
  { id: 'coral',      label: 'coral reefs',        accent: '#FF9F5C', sym: '⬡' },
  { id: 'soil',       label: 'soil microbiomes',   accent: '#FFC64D', sym: '▸' },
  { id: 'fauna',      label: 'fauna corridors',    accent: '#C084FC', sym: '○' },
  { id: 'wetlands',   label: 'wetlands',           accent: '#5CFFD0', sym: '◎' },
  { id: 'atmosphere', label: 'the atmosphere',     accent: '#94A3B8', sym: '◈' },
]

// Cards for the world canvas
const CANVAS_CARDS = [
  { id: 'c1', eco: 'Urban Forests',    metric: 'Health Score', val: '34%',  status: 'CRITICAL',    color: '#FF5C3A', x: -280, y: -90 },
  { id: 'c2', eco: 'Aquatic Systems',  metric: 'pH Level',     val: '6.1',  status: 'CRITICAL',    color: '#60C8FF', x: 220,  y: -100 },
  { id: 'c3', eco: 'Soil Microbiomes', metric: 'Carbon Seq.',  val: '−18%', status: 'WARNING',     color: '#FFC64D', x: -260, y: 100 },
  { id: 'c4', eco: 'Fauna Corridors',  metric: 'Species',      val: '61/97',status: 'WARNING',     color: '#C084FC', x: 200,  y: 90 },
  { id: 'c5', eco: 'Atmosphere',       metric: 'CO₂ Anomaly',  val: '+4.2%',status: 'MONITORING',  color: '#94A3B8', x: 0,    y: -160 },
  { id: 'c6', eco: 'Coral Reefs',      metric: 'Bleaching',    val: '31%',  status: 'CRITICAL',    color: '#FF9F5C', x: 0,    y: 150 },
]

function CanvasCard({ card }: { card: typeof CANVAS_CARDS[0] }) {
  return (
    <motion.div
      drag dragMomentum={false}
      initial={{ x: card.x, y: card.y, opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      style={{ position: 'absolute', cursor: 'grab', zIndex: 10 }}
    >
      <div className="rounded-xl border px-3 py-2.5 min-w-[130px] backdrop-blur-sm select-none"
        style={{ background: `${card.color}08`, borderColor: `${card.color}25`, boxShadow: `0 4px 20px ${card.color}10` }}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: `${card.color}70` }}>{card.eco}</span>
          <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: card.color, background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
            {card.status}
          </span>
        </div>
        <div className="font-mono text-[10px] text-white/40 mb-0.5">{card.metric}</div>
        <div className="font-serif text-lg font-bold" style={{ color: card.color }}>{card.val}</div>
      </div>
    </motion.div>
  )
}

// ─── Section 0 — Hero fill-in-blank ───────────────────────────────────────────
function HeroSection({ activeEco, setActiveEco }: {
  activeEco: typeof ECOSYSTEMS[0]; setActiveEco: (e: typeof ECOSYSTEMS[0]) => void
}) {
  return (
    <section className="relative w-screen h-screen flex flex-col items-center justify-center px-8 overflow-hidden">
      {/* Star field */}
      {[...Array(50)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white/20"
          style={{ width: Math.random() * 2 + 0.5 + 'px', height: Math.random() * 2 + 0.5 + 'px',
            left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', opacity: Math.random() * 0.4 + 0.05 }} />
      ))}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(92,255,208,1) 1px,transparent 1px),linear-gradient(90deg,rgba(92,255,208,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />

      <div className="relative text-center max-w-5xl mx-auto">
        <p className="font-mono text-[10px] text-white/25 tracking-[0.4em] uppercase mb-10">
          ◈ ARVI — Agentic Regeneration Via Intelligence
        </p>
        <h1 className="font-serif leading-none mb-6">
          <span className="block text-5xl sm:text-7xl lg:text-[88px] text-parchment mb-2">Agentic intelligence</span>
          <span className="block text-3xl sm:text-5xl lg:text-6xl text-parchment/50 mb-2">for the</span>
          <AnimatePresence mode="wait">
            <motion.span key={activeEco.id}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
              transition={{ duration: 0.35 }}
              className="block text-4xl sm:text-6xl lg:text-7xl font-serif italic border-b-2 pb-1"
              style={{ color: activeEco.accent, borderColor: `${activeEco.accent}50` }}>
              {activeEco.label}
            </motion.span>
          </AnimatePresence>
          <span className="block text-3xl sm:text-5xl lg:text-6xl text-parchment/50 mt-2">that makes our planet livable.</span>
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-6">
          {ECOSYSTEMS.map(eco => (
            <motion.button key={eco.id} onClick={() => setActiveEco(eco)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all"
              style={activeEco.id === eco.id
                ? { background: eco.accent, borderColor: eco.accent, color: '#0A0B14', fontWeight: 700 }
                : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(240,237,232,0.35)' }}>
              {eco.sym} {eco.label}
            </motion.button>
          ))}
        </div>
        <p className="font-mono text-[10px] text-white/20">— the agent cycles autonomously · click to override —</p>
        <motion.div animate={{ x: [0, 18, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute right-10 bottom-10 font-mono text-[10px] text-white/15 flex items-center gap-2">
          scroll to explore ——▸
        </motion.div>
      </div>
    </section>
  )
}

// ─── Section 1 — Interactive World Canvas ─────────────────────────────────────
function WorldCanvasSection() {
  return (
    <section className="relative w-screen h-screen flex flex-col items-center justify-center px-8 overflow-hidden"
      style={{ background: '#080910' }}>
      <p className="font-mono text-[10px] text-white/20 tracking-[0.3em] uppercase absolute top-20">
        ◎ Live intelligence network
      </p>
      <div className="relative" style={{ width: '560px', height: '400px' }}>
        {/* Mini world map in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ width: '260px', height: '160px' }}>
          <MiniWorldMap className="w-full h-full" />
        </div>
        {/* Connection lines (decorative) */}
        <svg className="absolute inset-0 pointer-events-none" width="560" height="400"
          style={{ overflow: 'visible' }}>
          {CANVAS_CARDS.map(c => (
            <line key={c.id}
              x1="280" y1="200"
              x2={280 + c.x + 65} y2={200 + c.y + 20}
              stroke={c.color} strokeOpacity="0.1" strokeWidth="1"
              strokeDasharray="4 4" />
          ))}
        </svg>
        {/* Draggable cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {CANVAS_CARDS.map(card => <CanvasCard key={card.id} card={card} />)}
        </div>
      </div>
      <p className="font-mono text-[10px] text-white/15 mt-8 absolute bottom-16">
        ↔ drag any card · hover map to zoom · live data from ARVI agent network
      </p>
    </section>
  )
}

// ─── What is ARVI (no buzzwords) ──────────────────────────────────────────────
function WhatIsARVI() {
  const points = [
    {
      sym: '◎',
      color: '#5CFFD0',
      title: 'Sensors in the field',
      body: 'Small nodes deployed in forests, rivers, and soil. They measure things satellites can\'t: canopy-level temperature, root zone moisture, pathogen risk, and the presence of bird species by sound. Tree-level precision, not city-level averages.',
    },
    {
      sym: '◈',
      color: '#A78BFA',
      title: 'An AI agent that never sleeps',
      body: 'ARVI\'s agent reads every sensor reading the moment it arrives. It doesn\'t alert on every spike — it identifies patterns, cross-references historical data, and only acts when it has high confidence something is wrong. No false alarms.',
    },
    {
      sym: '▸',
      color: '#FFC64D',
      title: 'Automatic action',
      body: 'When the agent confirms a threat, it doesn\'t send an email. It logs the event onchain, issues a structured alert, and triggers a USDC payment to the operator who reported the data. The response starts in under 2 seconds.',
    },
    {
      sym: '⬡',
      color: '#FF5C3A',
      title: 'Why this matters',
      body: 'Urban forests absorb carbon, cool cities, and filter air. Aquifers feed millions. Coral reefs protect coastlines. These systems are already under stress. Right now, detecting a plague requires a field visit. ARVI makes that automatic, verifiable, and self-sustaining.',
    },
  ]

  return (
    <section className="px-6 py-28 border-t border-white/5 bg-void">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">— What ARVI is</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-parchment leading-tight mb-4">
            No jargon. Here is exactly
            <br /><span className="text-aqua">what this does.</span>
          </h2>
          <p className="font-mono text-sm text-white/30 max-w-xl">
            If you can explain something simply, you understand it. Here is ARVI in plain language.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {points.map(p => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl border border-white/5 bg-surface p-7 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xl" style={{ color: p.color }}>{p.sym}</span>
                <span className="font-mono text-sm font-medium text-parchment/80">{p.title}</span>
              </div>
              <p className="text-parchment/45 text-sm leading-relaxed font-sans">{p.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Sensor differentiation */}
        <div className="mt-10 rounded-2xl border border-white/5 bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">What makes ARVI sensors different</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {['Metric', 'Open-Meteo', 'NASA FIRMS', 'ARVI Node'].map(h => (
                    <th key={h} className={`px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest ${h === 'ARVI Node' ? 'text-aqua' : 'text-white/20'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Temperature',    'City avg',    '—',           'Canopy-level'],
                  ['Humidity',       'Station avg', '—',           'Root zone'],
                  ['Fire detection', '—',           'Hotspot only', 'Pathogen + heat'],
                  ['Biodiversity',   '—',           '—',           'Audio species index'],
                  ['Soil moisture',  '—',           '—',           'Root saturation'],
                  ['Verification',   'None',        'None',        'Onchain signed'],
                  ['Incentives',     'None',        'None',        'USDC auto-payment'],
                ].map(([metric, om, firms, arvi]) => (
                  <tr key={metric} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="px-5 py-3 font-mono text-white/50">{metric}</td>
                    <td className="px-5 py-3 font-mono text-white/25">{om}</td>
                    <td className="px-5 py-3 font-mono text-white/25">{firms}</td>
                    <td className="px-5 py-3 font-mono text-aqua font-bold">{arvi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Business model ───────────────────────────────────────────────────────────
function BusinessModel() {
  return (
    <section className="px-6 py-24 border-t border-white/5 bg-void">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-[10px] text-white/25 tracking-[0.3em] uppercase mb-4">— Business model</p>
        <h2 className="font-serif text-4xl lg:text-5xl text-parchment mb-4">
          Self-sustaining,<br /><span className="text-aqua">not dependent on grants.</span>
        </h2>
        <p className="text-parchment/35 text-sm font-sans mb-14 max-w-xl">Every participant is economically incentivized. The agent pays for its own intelligence from subscription revenue.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { sym: '◎', label: 'Node Subscriptions',      val: '$1,200/node/yr', desc: 'Hardware + data access per deployed sensor' },
            { sym: '◈', label: 'Enterprise Data API',      val: '$500/mo',        desc: 'Municipalities and NGOs buy verified ecosystem feeds' },
            { sym: '▸', label: 'Alert Intelligence',       val: '$2,000/mo',      desc: 'AI-classified alerts with intervention recommendations' },
            { sym: '⬡', label: 'Carbon Oracle',            val: '$0.80/tonne',    desc: 'Onchain proof of carbon absorption for verified preservation' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-surface p-6 hover:border-aqua/10 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-aqua">{s.sym}</span>
                  <span className="font-mono text-sm text-parchment/80">{s.label}</span>
                </div>
                <span className="font-mono text-sm text-aqua">{s.val}</span>
              </div>
              <p className="text-xs text-parchment/35 font-sans">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/5 bg-surface overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <span className="font-mono text-[11px] text-parchment/60">3-Year Growth Projection</span>
            <span className="font-mono text-[10px] text-white/20">Conservative estimate</span>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/5">
              {['Period', 'Nodes', 'Ecosystems', 'Trees Protected', 'Revenue'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mono text-[10px] text-white/20 uppercase tracking-widest">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                ['Year 1', '50',   '2',  '14K',  '$42K'],
                ['Year 2', '250',  '4',  '70K',  '$280K'],
                ['Year 3', '1,000','5+', '280K', '$1.4M'],
              ].map((row, i) => (
                <tr key={row[0]} className={`border-b border-white/5 ${i === 2 ? 'bg-aqua/5' : ''}`}>
                  <td className="px-5 py-4 font-mono text-parchment/60">{row[0]}</td>
                  <td className="px-5 py-4 font-mono text-aqua font-bold">{row[1]}</td>
                  <td className="px-5 py-4 font-mono text-white/40">{row[2]}</td>
                  <td className="px-5 py-4 font-mono text-white/40">{row[3]}</td>
                  <td className="px-5 py-4 font-mono text-aqua font-bold">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-solar/20 bg-solar/5 p-6">
          <p className="font-mono text-[11px] text-solar mb-5">⬡ Public Goods Impact (Octant track · Year 3)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['432K','Sensor readings/yr'],['$720K','Paid to operators'],['280K','Trees protected'],['1K','Community nodes']].map(([v, l]) => (
              <div key={l}>
                <div className="font-serif text-3xl text-solar mb-1">{v}</div>
                <div className="font-mono text-[10px] text-parchment/35">{l}</div>
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
    <section className="px-6 py-24 border-t border-white/5 bg-void text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-4xl lg:text-5xl text-parchment mb-4">
          The planet generates data.<br />
          <span className="text-aqua">ARVI acts on it.</span>
        </h2>
        <p className="text-parchment/35 text-sm font-sans mb-10 max-w-md mx-auto">
          Deploy a sensor node. Join the first autonomous multi-ecosystem intelligence network.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="px-8 py-4 rounded-xl font-mono text-sm font-bold text-void bg-aqua hover:bg-aqua/90 transition-all" style={{ boxShadow: '0 0 40px rgba(92,255,208,0.2)' }}>
            Launch App ▸
          </Link>
          <Link href="/atlas" className="px-8 py-4 rounded-xl border border-white/10 text-parchment/55 font-mono text-sm hover:border-white/20 transition-all">
            ◎ View Atlas
          </Link>
          <Link href="/register" className="px-8 py-4 rounded-xl border border-white/10 text-parchment/55 font-mono text-sm hover:border-white/20 transition-all">
            Register a Node
          </Link>
        </div>
        <p className="font-mono text-[10px] text-white/12 mt-8">
          ERC-8004 · <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a" target="_blank" rel="noopener" className="underline hover:text-aqua/30">0xb8623d...cf43a</a> · Base Mainnet · Pantera Labs 2026
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-8 bg-void">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-white/18">
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

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ section }: { section: number }) {
  const labels = ['Awakening', 'World Canvas']
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-void/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-aqua/30 bg-aqua/10 flex items-center justify-center font-mono text-aqua text-xs">◈</div>
          <span className="font-mono text-sm text-parchment/80">ARVI</span>
          <span className="hidden sm:block font-mono text-[9px] border border-white/10 px-2 py-0.5 rounded text-white/25">v3.0 · Base Mainnet</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {labels.map((l, i) => (
            <span key={l} className={`font-mono text-[10px] px-2 py-1 rounded transition-all ${i === section ? 'text-aqua border border-aqua/25 bg-aqua/5' : 'text-white/20'}`}>{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/atlas" className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors hidden sm:block">Atlas</Link>
          <Link href="/dashboard" className="font-mono text-[11px] px-4 py-2 rounded border border-aqua/30 bg-aqua/5 text-aqua hover:bg-aqua/10 transition-all">Launch App ▸</Link>
        </div>
      </div>
    </nav>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SCROLL_SECTIONS = 2

export default function Landing() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(SCROLL_SECTIONS - 1) * 100}vw`])

  const [scrollProg, setScrollProg] = useState(0)
  const [activeEco, setActiveEco] = useState(ECOSYSTEMS[0])

  useEffect(() => scrollYProgress.on('change', v => setScrollProg(v)), [scrollYProgress])
  useEffect(() => {
    let i = 0
    const t = setInterval(() => { i = (i + 1) % ECOSYSTEMS.length; setActiveEco(ECOSYSTEMS[i]) }, 2800)
    return () => clearInterval(t)
  }, [])

  const section = Math.round(scrollProg * (SCROLL_SECTIONS - 1))

  return (
    <div className="bg-void min-h-screen">
      <Nav section={section} />

      {/* Horizontal scroll world — 2 sections */}
      <div ref={scrollRef} style={{ height: `${SCROLL_SECTIONS * 100}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden">
          <motion.div style={{ x, display: 'flex', width: `${SCROLL_SECTIONS * 100}vw`, height: '100vh' }}>
            <HeroSection activeEco={activeEco} setActiveEco={setActiveEco} />
            <WorldCanvasSection />
          </motion.div>
        </div>
      </div>

      {/* Vertical sections */}
      <WhatIsARVI />
      <BusinessModel />
      <CTA />
      <Footer />
    </div>
  )
}
