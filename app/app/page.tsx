'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

// ─── Floating intelligence cards (draggable) ───────────────────────────────
const INTEL_CARDS = [
  {
    id: 'alert-01',
    icon: '🔴',
    label: 'CRITICAL ALERT',
    value: 'Probable plague',
    sub: 'Chapultepec · node-01',
    color: '#ef4444',
    x: -340, y: -80,
  },
  {
    id: 'payment-01',
    icon: '💸',
    label: 'PAYMENT SENT',
    value: '9 USDC',
    sub: '→ 0x7099...79C8 via Locus',
    color: '#01f094',
    x: 320, y: -100,
  },
  {
    id: 'node-health',
    icon: '📡',
    label: 'NETWORK HEALTH',
    value: '52%',
    sub: '3 nodes · CDMX',
    color: '#eab308',
    x: -300, y: 140,
  },
  {
    id: 'agent-active',
    icon: '🧠',
    label: 'AGENT ACTIVE',
    value: 'Gemini 2.5',
    sub: 'via Bankr Gateway',
    color: '#a78bfa',
    x: 290, y: 120,
  },
  {
    id: 'erc8004',
    icon: '🔗',
    label: 'ERC-8004 IDENTITY',
    value: 'Base Mainnet',
    sub: '0xb8623d...cf43a',
    color: '#60a5fa',
    x: 0, y: 190,
  },
]

function DraggableCard({ card }: { card: typeof INTEL_CARDS[0] }) {
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: card.x, y: card.y, opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.4 }}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      style={{ position: 'absolute', cursor: 'grab', zIndex: 10 }}
      className="select-none"
    >
      <div
        className="rounded-xl border backdrop-blur-sm px-4 py-3 min-w-[160px]"
        style={{
          background: `${card.color}08`,
          borderColor: `${card.color}30`,
          boxShadow: `0 4px 24px ${card.color}15`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{card.icon}</span>
          <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: `${card.color}80` }}>
            {card.label}
          </span>
        </div>
        <div className="text-sm font-bold text-white">{card.value}</div>
        <div className="text-[10px] text-white/30 mt-0.5">{card.sub}</div>
      </div>
    </motion.div>
  )
}

// ─── Autonomous agent cursor ────────────────────────────────────────────────
const AGENT_PATH = [
  { x: -340, y: -80 },   // alert card
  { x: 320, y: -100 },   // payment card
  { x: -300, y: 140 },   // network card
  { x: 290, y: 120 },    // agent card
  { x: 0, y: 190 },      // identity card
  { x: 0, y: 0 },        // center
]

function AgentCursor({ centerRef }: { centerRef: React.RefObject<HTMLDivElement | null> }) {
  const [step, setStep] = useState(0)
  const [reading, setReading] = useState(false)

  useEffect(() => {
    const tick = () => {
      setReading(true)
      setTimeout(() => {
        setReading(false)
        setStep(s => (s + 1) % AGENT_PATH.length)
      }, 900)
    }
    const interval = setInterval(tick, 2200)
    return () => clearInterval(interval)
  }, [])

  const target = AGENT_PATH[step]

  return (
    <motion.div
      animate={{ x: target.x, y: target.y }}
      transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: 'absolute', pointerEvents: 'none', zIndex: 20 }}
    >
      {/* Agent cursor body */}
      <motion.div
        animate={{ scale: reading ? 1.6 : 1, opacity: reading ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
        className="relative flex items-center justify-center"
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-[#01f094] bg-[#01f094]/20"
          style={{ boxShadow: reading ? '0 0 20px #01f094, 0 0 40px #01f09440' : '0 0 8px #01f09440' }}
        />
        {/* Reading pulse rings */}
        <AnimatePresence>
          {reading && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute w-5 h-5 rounded-full border border-[#01f094]"
            />
          )}
        </AnimatePresence>
      </motion.div>
      {/* Agent label */}
      <motion.div
        animate={{ opacity: reading ? 1 : 0 }}
        className="absolute top-6 left-6 text-[9px] font-mono text-[#01f094] whitespace-nowrap"
        style={{ textShadow: '0 0 8px #01f094' }}
      >
        ARVI.analyze()
      </motion.div>
    </motion.div>
  )
}

// ─── Stats ──────────────────────────────────────────────────────────────────
const STATS = [
  { value: '3', label: 'Active Nodes', sub: 'CDMX Urban Forest' },
  { value: '847', label: 'Trees Monitored', sub: 'Real-time telemetry' },
  { value: '< 2s', label: 'Detection Latency', sub: 'Anomaly to alert' },
  { value: '9 USDC', label: 'Per Alert Reward', sub: 'Auto via Locus' },
]

const STEPS = [
  { num: '01', title: 'Sense', desc: 'Node operators deploy sensors in urban forests — temperature, humidity, soil, and visual data transmitted to the network continuously.', icon: '📡' },
  { num: '02', title: 'Analyze', desc: "ARVI's onchain AI agent — powered by Bankr's LLM Gateway — detects plagues, dehydration, heat stress, and deforestation signals with 90%+ confidence.", icon: '🧠' },
  { num: '03', title: 'Act', desc: 'Verified threats trigger alerts, immutable logs, and automatic USDC payments to node operators via Locus. Zero human intervention.', icon: '⚡' },
]

// ─── Business model data ─────────────────────────────────────────────────────
const REVENUE_STREAMS = [
  { label: 'Node Operator Fees', desc: 'Annual hardware + data subscription per deployed node', value: '$1,200/node/yr', icon: '📡' },
  { label: 'Enterprise Data API', desc: 'Municipalities, researchers, and NGOs subscribe to verified forest health feeds', value: '$500/mo', icon: '🏛️' },
  { label: 'Alert Intelligence', desc: 'Premium real-time alerts with recommended interventions for city governments', value: '$2,000/mo', icon: '⚡' },
  { label: 'Carbon Credit Verification', desc: 'Immutable onchain proof of carbon absorption for verified forest preservation', value: '$0.80/tonne', icon: '🌿' },
]

const KPI_PROJECTIONS = [
  { period: 'Year 1', nodes: '50', trees: '14K', revenue: '$42K', operators: '50', alert_revenue: '$24K' },
  { period: 'Year 2', nodes: '250', trees: '70K', revenue: '$280K', operators: '250', alert_revenue: '$144K' },
  { period: 'Year 3', nodes: '1,000', trees: '280K', revenue: '$1.4M', operators: '1,000', alert_revenue: '$720K' },
]

const OCTANT_METRICS = [
  { label: 'Data Collection Events', value: '432K', sub: 'Readings/year at scale (1K nodes)' },
  { label: 'AI Analysis Runs', value: '17K', sub: 'Anomaly detection cycles/year' },
  { label: 'Payments to Operators', value: '$720K', sub: 'Direct economic value to communities' },
  { label: 'Trees Protected', value: '280K', sub: 'Urban carbon infrastructure secured' },
]

const SPONSORS = [
  { name: 'Protocol Labs', role: 'Agent Identity (ERC-8004)', color: '#0090FF' },
  { name: 'Bankr', role: 'LLM Intelligence Gateway', color: '#FF6B35' },
  { name: 'Locus', role: 'Autonomous USDC Payments', color: '#7C3AED' },
  { name: 'ENS', role: 'Node Naming Layer', color: '#5AC8FA' },
  { name: 'Octant', role: 'Public Goods Funding', color: '#F59E0B' },
  { name: 'EVVM', role: 'Micropayment Infrastructure', color: '#34D399' },
]

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-[#060a07] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060a07]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#01f094]/10 border border-[#01f094]/30 flex items-center justify-center">
              <span className="text-xs">🌿</span>
            </div>
            <span className="font-bold tracking-tight">ARVI</span>
            <span className="hidden sm:block text-xs text-white/20 font-mono border border-white/10 px-2 py-0.5 rounded">
              v1.0 · Base Mainnet
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/atlas" className="text-xs px-3 py-2 rounded-lg text-white/40 hover:text-white/70 transition-colors hidden sm:block">
              🗺️ Atlas
            </Link>
            <Link href="/register" className="text-xs px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:border-white/20 transition-all hidden sm:block">
              Register Node
            </Link>
            <Link href="/dashboard" className="text-xs px-4 py-2 rounded-lg bg-[#01f094] text-black font-bold hover:bg-[#01f094]/90 transition-all">
              Launch App →
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO — Interactive Intelligence Space ═══ */}
      <section ref={heroRef} className="relative pt-36 pb-24 px-6 overflow-hidden" style={{ minHeight: '92vh' }}>
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(1,240,148,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(1,240,148,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#01f094]/4 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#01f094]/20 bg-[#01f094]/5 text-[#01f094] text-xs font-mono mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#01f094] animate-pulse" />
            Autonomous · Onchain · Real-time · Climate Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6"
          >
            The intelligence layer
            <br />
            <span className="text-[#01f094]">urban forests</span>
            <br />
            have been waiting for.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/35 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            An autonomous AI agent that monitors, detects, and acts — paying operators automatically through verified onchain intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4"
          >
            <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-[#01f094] text-black font-bold text-sm hover:bg-[#01f094]/90 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(1,240,148,0.2)]">
              Launch App →
            </Link>
            <Link href="/atlas" className="px-8 py-4 rounded-xl border border-white/10 text-white/60 text-sm hover:border-[#01f094]/30 hover:text-white/80 transition-all">
              🗺️ View Atlas
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-white/15 font-mono"
          >
            ERC-8004 Identity ·{' '}
            <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a" target="_blank" rel="noopener" className="underline hover:text-[#01f094]/40">
              0xb8623d...cf43a
            </a>
            {' '}· Base Mainnet
          </motion.div>

          {/* ── Draggable intelligence space ── */}
          <div
            ref={centerRef}
            className="relative mx-auto mt-8"
            style={{ height: '380px', width: '100%', maxWidth: '700px' }}
          >
            {/* Center agent node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
              <div className="w-16 h-16 rounded-full border border-[#01f094]/20 bg-[#01f094]/5 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border border-[#01f094]/40 bg-[#01f094]/10 flex items-center justify-center text-lg">🌿</div>
              </div>
              {/* Orbit rings */}
              <div className="absolute inset-0 -m-8 rounded-full border border-white/5 animate-spin" style={{ animationDuration: '20s' }} />
              <div className="absolute inset-0 -m-16 rounded-full border border-white/[0.03]" />
            </div>

            {/* Autonomous agent cursor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <AgentCursor centerRef={centerRef} />
            </div>

            {/* Draggable intel cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {INTEL_CARDS.map(card => (
                <DraggableCard key={card.id} card={card} />
              ))}
            </div>

            {/* Helper label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/15 whitespace-nowrap">
              ↔ drag any card · watch the agent analyze
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 pb-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pt-16">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center hover:border-[#01f094]/20 transition-all">
              <div className="text-3xl font-black text-[#01f094] mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-white/70">{s.label}</div>
              <div className="text-xs text-white/25 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-[#01f094]/60 mb-3 tracking-widest uppercase">How it works</div>
            <h2 className="text-3xl sm:text-4xl font-black">From sensor to action, <span className="text-[#01f094]">fully autonomous.</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-[#01f094]/20 hover:bg-[#01f094]/[0.02] transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-2xl">{step.icon}</div>
                  <div>
                    <div className="text-xs font-mono text-[#01f094]/40 mb-0.5">{step.num}</div>
                    <div className="font-bold text-lg">{step.title}</div>
                  </div>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SENSORS ARE SPECIAL */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-mono text-yellow-400/60 mb-3 tracking-widest uppercase">Why not just use APIs?</div>
            <h2 className="text-3xl font-black mb-4 leading-snug">Open-Meteo gives cities. <span className="text-[#01f094]">ARVI gives trees.</span></h2>
            <p className="text-white/40 leading-relaxed mb-6">Weather APIs give you the temperature of a district. ARVI gives you the health status of the Ahuehuete in Section 7 of Chapultepec with cryptographic proof of who reported it and automatic payment for that proof.</p>
            <ul className="space-y-3">
              {[
                ['Hyperlocal precision', 'Tree-level readings — not city-level averages'],
                ['Cryptographic provenance', 'Every reading signed onchain — not just scraped from an API'],
                ['Economic incentives', 'Operators get paid for quality data — satellite APIs don\'t pay communities'],
                ['Agent intelligence', 'Not raw data — AI-analyzed threat classification with confidence scores'],
                ['Composable oracle', 'Any smart contract can consume ARVI alerts — it\'s programmable environmental truth'],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3 text-sm">
                  <span className="text-[#01f094] shrink-0 mt-0.5">✓</span>
                  <span><span className="text-white/70 font-medium">{title}</span><span className="text-white/35"> — {desc}</span></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <div className="text-xs font-mono text-white/25 mb-4 uppercase tracking-widest">Comparison</div>
            <div className="space-y-3 text-xs">
              {[
                { label: 'OpenWeatherMap', coverage: 'City-level', proof: 'None', payment: 'None', intelligence: 'None', color: '#ffffff20' },
                { label: 'NASA FIRMS', coverage: 'Fire hotspots', proof: 'None', payment: 'None', intelligence: 'None', color: '#ffffff20' },
                { label: 'ARVI', coverage: 'Tree-level', proof: 'Onchain', payment: 'USDC auto', intelligence: 'LLM agent', color: '#01f094' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: `${row.color}08`, border: `1px solid ${row.color}20` }}>
                  <span className="font-bold w-28 shrink-0" style={{ color: row.color }}>{row.label}</span>
                  <span className="text-white/40 flex-1">{row.coverage}</span>
                  <span className="text-white/40 flex-1">{row.proof}</span>
                  <span className="text-white/40 flex-1">{row.intelligence}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BUSINESS MODEL ═══ */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-[#01f094]/60 mb-3 tracking-widest uppercase">Business Model</div>
            <h2 className="text-3xl sm:text-4xl font-black">Sustainable infrastructure, <span className="text-[#01f094]">not charity.</span></h2>
            <p className="text-white/30 mt-3 max-w-xl mx-auto">ARVI is a self-sustaining network. Every participant is economically incentivized. No grants required to operate.</p>
          </div>

          {/* Revenue streams */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {REVENUE_STREAMS.map(stream => (
              <motion.div
                key={stream.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:border-[#01f094]/15 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{stream.icon}</span>
                    <span className="font-bold text-sm text-white/80">{stream.label}</span>
                  </div>
                  <span className="text-[#01f094] font-mono text-sm font-bold">{stream.value}</span>
                </div>
                <p className="text-xs text-white/35 leading-relaxed">{stream.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Projections table */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden mb-12">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Growth Projections</h3>
              <span className="text-xs text-white/25 font-mono">Conservative estimate · 3-year horizon</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Period', 'Nodes', 'Trees', 'Total Revenue', 'Operators Paid', 'Alert Revenue'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-white/25 font-mono uppercase tracking-wide text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KPI_PROJECTIONS.map((row, i) => (
                    <tr key={row.period} className={`border-b border-white/5 ${i === KPI_PROJECTIONS.length - 1 ? 'bg-[#01f094]/5' : ''}`}>
                      <td className="px-6 py-4 font-bold text-white/70">{row.period}</td>
                      <td className="px-6 py-4 text-[#01f094] font-mono font-bold">{row.nodes}</td>
                      <td className="px-6 py-4 text-white/50 font-mono">{row.trees}</td>
                      <td className="px-6 py-4 text-[#01f094] font-bold">{row.revenue}</td>
                      <td className="px-6 py-4 text-white/50 font-mono">{row.operators}</td>
                      <td className="px-6 py-4 text-white/50 font-mono">{row.alert_revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Octant public goods KPIs */}
          <div className="rounded-2xl border border-[#F59E0B]/15 bg-[#F59E0B]/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-lg">🏛️</span>
              <h3 className="font-bold text-sm text-[#F59E0B]">Public Goods Metrics (Octant Track)</h3>
              <span className="text-xs text-white/20 font-mono ml-auto">Year 3 at scale</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {OCTANT_METRICS.map(m => (
                <div key={m.label} className="text-center">
                  <div className="text-2xl font-black text-[#F59E0B] mb-1">{m.value}</div>
                  <div className="text-xs font-medium text-white/50">{m.label}</div>
                  <div className="text-[10px] text-white/25 mt-1">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="px-6 py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs font-mono text-white/20 mb-8 tracking-widest uppercase">Built with</div>
          <div className="flex flex-wrap justify-center gap-3">
            {SPONSORS.map(s => (
              <div key={s.name} className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all">
                <div className="text-xs font-bold text-white/70">{s.name}</div>
                <div className="text-xs text-white/25 mt-0.5">{s.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black mb-4">
            Ready to protect your <span className="text-[#01f094]">urban canopy?</span>
          </h2>
          <p className="text-white/35 mb-10 text-lg">Deploy a sensor node and become part of the first autonomous urban forest intelligence network.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-[#01f094] text-black font-bold text-sm hover:bg-[#01f094]/90 transition-all shadow-[0_0_40px_rgba(1,240,148,0.15)]">Launch App →</Link>
            <Link href="/atlas" className="px-8 py-4 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 transition-all">🗺️ View Atlas</Link>
            <Link href="/register" className="px-8 py-4 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 transition-all">Register a Node</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <div className="font-mono">ARVI — Agentic Regeneration Via Intelligence</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/ValenteCreativo/ARVI" target="_blank" rel="noopener" className="hover:text-white/40 transition-colors">GitHub</a>
            <Link href="/atlas" className="hover:text-white/40 transition-colors">Atlas</Link>
            <Link href="/dashboard" className="hover:text-white/40 transition-colors">App</Link>
          </div>
          <div className="font-mono">Pantera Labs · 2026</div>
        </div>
      </footer>
    </div>
  )
}
