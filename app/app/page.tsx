import Link from 'next/link'

const stats = [
  { value: '3', label: 'Active Nodes', sub: 'CDMX Urban Forest' },
  { value: '847', label: 'Trees Monitored', sub: 'Real-time telemetry' },
  { value: '< 2s', label: 'Detection Latency', sub: 'Anomaly to alert' },
  { value: '9 USDC', label: 'Per Alert Reward', sub: 'Auto via Locus' },
]

const steps = [
  {
    num: '01',
    title: 'Sense',
    desc: 'Node operators deploy sensors in urban forests. They capture temperature, humidity, soil moisture, and visual data — and transmit raw readings to the network.',
    icon: '📡',
  },
  {
    num: '02',
    title: 'Analyze',
    desc: 'ARVI\'s onchain AI agent — powered by Bankr\'s LLM Gateway — processes sensor data autonomously. It detects plagues, dehydration, heat stress, and deforestation signals with 90%+ confidence.',
    icon: '🧠',
  },
  {
    num: '03',
    title: 'Act',
    desc: 'When a threat is confirmed, ARVI triggers an alert, logs it to the immutable agent ledger, and automatically rewards the node operator in USDC via Locus — no human intervention required.',
    icon: '⚡',
  },
]

const sponsors = [
  { name: 'Protocol Labs', role: 'Identity Infrastructure', color: '#0090FF' },
  { name: 'Bankr', role: 'LLM Intelligence', color: '#FF6B35' },
  { name: 'Locus', role: 'Autonomous Payments', color: '#7C3AED' },
  { name: 'ENS', role: 'Node Naming', color: '#5AC8FA' },
  { name: 'Octant', role: 'Public Goods', color: '#F59E0B' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#060a07] text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060a07]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#01f094]/10 border border-[#01f094]/30 flex items-center justify-center">
              <span className="text-xs">🌿</span>
            </div>
            <span className="font-bold tracking-tight text-white">ARVI</span>
            <span className="hidden sm:block text-xs text-white/20 font-mono border border-white/10 px-2 py-0.5 rounded">
              v1.0 · Base Mainnet
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ValenteCreativo/ARVI"
              target="_blank"
              rel="noopener"
              className="text-xs text-white/40 hover:text-white/70 transition-colors hidden sm:block"
            >
              GitHub ↗
            </a>
            <Link
              href="/register"
              className="text-xs px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80 transition-all"
            >
              Register a Sensor
            </Link>
            <Link
              href="/dashboard"
              className="text-xs px-4 py-2 rounded-lg bg-[#01f094] text-black font-bold hover:bg-[#01f094]/90 transition-all"
            >
              Launch App →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(1,240,148,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(1,240,148,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#01f094]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#01f094]/20 bg-[#01f094]/5 text-[#01f094] text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#01f094] animate-pulse" />
            Autonomous · Onchain · Real-time
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
            The intelligence layer
            <br />
            <span className="text-[#01f094]">urban forests</span>
            <br />
            have been waiting for.
          </h1>

          <p className="text-lg text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
            ARVI is an autonomous AI agent that monitors urban forest ecosystems,
            detects environmental threats in real time, and triggers verified
            responses — without human intervention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-[#01f094] text-black font-bold text-sm hover:bg-[#01f094]/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(1,240,148,0.25)]"
            >
              Launch App →
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 hover:text-white/80 transition-all"
            >
              Register a Sensor Node
            </Link>
          </div>

          {/* Onchain badge */}
          <div className="mt-8 text-xs text-white/20 font-mono">
            ERC-8004 Identity ·{' '}
            <a
              href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
              target="_blank"
              rel="noopener"
              className="underline hover:text-[#01f094]/50"
            >
              0xb8623d...cf43a
            </a>
            {' '}· Base Mainnet
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center hover:border-[#01f094]/20 transition-all"
            >
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
            <h2 className="text-3xl sm:text-4xl font-black">
              From sensor to action,{' '}
              <span className="text-[#01f094]">fully autonomous.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-6 h-px bg-[#01f094]/15 z-10" />
                )}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-7 hover:border-[#01f094]/20 hover:bg-[#01f094]/[0.02] transition-all h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-2xl">{step.icon}</div>
                    <div>
                      <div className="text-xs font-mono text-[#01f094]/40 mb-0.5">{step.num}</div>
                      <div className="font-bold text-lg">{step.title}</div>
                    </div>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-mono text-red-400/60 mb-3 tracking-widest uppercase">The Problem</div>
            <h2 className="text-3xl font-black mb-4 leading-snug">
              Urban forests die in silence.
            </h2>
            <p className="text-white/40 leading-relaxed mb-4">
              Cities like Mexico City have millions of trees absorbing carbon, cooling streets, and filtering air.
              But monitoring them requires expensive field teams, infrequent inspections, and slow reporting chains.
            </p>
            <p className="text-white/40 leading-relaxed">
              By the time a plague or deforestation event is detected by conventional means,
              the damage is already irreversible.
            </p>
          </div>

          <div>
            <div className="text-xs font-mono text-[#01f094]/60 mb-3 tracking-widest uppercase">The Solution</div>
            <h2 className="text-3xl font-black mb-4 leading-snug">
              An AI agent that{' '}
              <span className="text-[#01f094]">never sleeps.</span>
            </h2>
            <ul className="space-y-3">
              {[
                'Distributed IoT sensor nodes report raw data continuously',
                'ARVI\'s onchain agent analyzes every reading with LLM intelligence',
                'Anomalies are detected in under 2 seconds — plague, drought, heat stress',
                'Verified alerts are logged immutably; operators are paid automatically',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                  <span className="text-[#01f094] mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs font-mono text-white/20 mb-8 tracking-widest uppercase">Built with</div>
          <div className="flex flex-wrap justify-center gap-3">
            {sponsors.map((s) => (
              <div
                key={s.name}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
              >
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
            Ready to protect your{' '}
            <span className="text-[#01f094]">urban canopy?</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Deploy a sensor node and become part of the first autonomous urban forest intelligence network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl bg-[#01f094] text-black font-bold text-sm hover:bg-[#01f094]/90 transition-all shadow-[0_0_40px_rgba(1,240,148,0.2)]"
            >
              Launch App →
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 hover:text-white/80 transition-all"
            >
              Register a Sensor Node
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/20">
          <div className="font-mono">ARVI — Agentic Regeneration Via Intelligence</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/ValenteCreativo/ARVI" target="_blank" rel="noopener" className="hover:text-white/40 transition-colors">GitHub</a>
            <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a" target="_blank" rel="noopener" className="hover:text-white/40 transition-colors">Onchain Identity</a>
            <Link href="/dashboard" className="hover:text-white/40 transition-colors">App</Link>
          </div>
          <div className="font-mono">Pantera Labs · 2026</div>
        </div>
      </footer>
    </div>
  )
}
