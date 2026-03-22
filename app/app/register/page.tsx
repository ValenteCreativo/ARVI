'use client'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function RegisterNode() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', location: '', wallet: '', email: '', type: 'urban-forest' })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#F7F7F7' }}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-px h-16 bg-[#DADADA] mx-auto mb-10" />
          <p className="font-mono text-xs tracking-[0.4em] uppercase mb-4" style={{ color: 'rgba(17,17,17,0.45)' }}>
            Node Registered
          </p>
          <h2 className="font-serif text-4xl text-ink mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)' }}>
            Welcome to the network.
          </h2>
          <p className="font-mono text-sm mb-8" style={{ color: 'rgba(17,17,17,0.55)' }}>
            Your node request is queued. ARVI agents will verify your location and activate your node within 24h.
            USDC rewards flow automatically once your first anomaly is confirmed.
          </p>
          <Link href="/" className="font-mono text-sm px-8 py-3 rounded-xl inline-block transition-all hover:scale-105"
            style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
            ← Back to ARVI
          </Link>
          <div className="w-px h-16 bg-[#DADADA] mx-auto mt-10" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F7' }}>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Nav — matches landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-8"
        style={{ background: 'rgba(247,247,247,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(17,17,17,0.06)' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-ink/20 flex items-center justify-center font-mono text-sm">○</div>
          <span className="font-mono text-sm font-bold tracking-tight text-ink">ARVI</span>
        </Link>
        <Link href="/dashboard" className="font-mono text-xs px-4 py-2 rounded-xl transition-all hover:scale-105"
          style={{ background: '#2E7D6B', color: 'white' }}>
          Launch App ▸
        </Link>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-24">

        {/* Header — landing style */}
        <motion.div className="w-px h-12 bg-[#DADADA] mb-10"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ originY: 0 }} />

        <motion.p className="font-mono text-xs tracking-[0.4em] uppercase mb-4"
          style={{ color: 'rgba(17,17,17,0.45)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          ARVI — Node Registration
        </motion.p>

        <motion.h1 className="font-serif text-ink leading-tight mb-3"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
          Register a Sensor Node.
        </motion.h1>

        <motion.p className="font-mono text-sm mb-12 leading-relaxed"
          style={{ color: 'rgba(17,17,17,0.55)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          Deploy a monitoring node in an urban forest area. Every verified environmental anomaly
          your node detects earns you <span style={{ color: '#2E7D6B', fontWeight: 700 }}>6–12 USDC automatically</span> — paid via Locus on Base, no invoice required.
        </motion.p>

        {/* How it works — minimal cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          {[
            { n: '01', t: 'Deploy',  b: 'Place your sensor node in an urban forest, park, or green zone.', color: '#2E7D6B' },
            { n: '02', t: 'Stream',  b: 'Node sends temperature, humidity, CO₂, soil moisture, AQI.', color: '#5e72e4' },
            { n: '03', t: 'Detect',  b: 'ARVI agent analyzes data with AI — flags anomalies in minutes.', color: '#1a6b8a' },
            { n: '04', t: 'Earn',    b: 'Locus pays you USDC onchain for every confirmed threat event.', color: '#f5a623' },
          ].map(s => (
            <div key={s.n} className="rounded-xl border p-4"
              style={{ background: 'white', borderColor: 'rgba(17,17,17,0.08)' }}>
              <p className="font-mono text-xs font-bold mb-1" style={{ color: s.color }}>{s.n} — {s.t}</p>
              <p className="font-mono text-xs" style={{ color: 'rgba(17,17,17,0.50)' }}>{s.b}</p>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.div className="rounded-2xl border p-8 space-y-6"
          style={{ background: 'white', borderColor: 'rgba(17,17,17,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>

          {[
            { key: 'name',     label: 'Operator Name',            placeholder: 'e.g. Chapultepec Observer',         type: 'text' },
            { key: 'location', label: 'Forest Location',          placeholder: 'e.g. Bosque de Chapultepec, CDMX',  type: 'text' },
            { key: 'wallet',   label: 'Wallet Address (USDC rewards)', placeholder: '0x…',                         type: 'text' },
            { key: 'email',    label: 'Email',                    placeholder: 'for activation notice',             type: 'email' },
          ].map(f => (
            <div key={f.key}>
              <label className="block font-mono text-[10px] tracking-[0.35em] uppercase mb-2"
                style={{ color: 'rgba(17,17,17,0.40)' }}>{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none transition-all"
                style={{ background: '#F7F7F7', border: '1px solid rgba(17,17,17,0.10)', color: '#111' }}
                onFocus={e => (e.target.style.borderColor = '#2E7D6B')}
                onBlur={e => (e.target.style.borderColor = 'rgba(17,17,17,0.10)')}
              />
            </div>
          ))}

          {/* Node type */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.35em] uppercase mb-2"
              style={{ color: 'rgba(17,17,17,0.40)' }}>Node Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'urban-forest', label: '🌳 Urban Forest' },
                { id: 'wetland',      label: '💧 Wetland / Wetzone' },
                { id: 'park',         label: '🌿 City Park' },
                { id: 'private',      label: '🏔 Private Land' },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => set('type', t.id)}
                  className="rounded-xl px-4 py-3 font-mono text-xs text-left transition-all"
                  style={{
                    background: form.type === t.id ? 'rgba(46,125,107,0.08)' : '#F7F7F7',
                    border: `1px solid ${form.type === t.id ? '#2E7D6B' : 'rgba(17,17,17,0.10)'}`,
                    color: form.type === t.id ? '#2E7D6B' : 'rgba(17,17,17,0.55)',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setSubmitted(true)}
            className="w-full py-4 rounded-xl font-mono text-sm font-bold transition-all hover:scale-[1.02]"
            style={{ background: '#2E7D6B', color: 'white', boxShadow: '0 4px 20px rgba(46,125,107,0.25)' }}>
            Register Node ▸
          </button>

          <p className="font-mono text-[10px] text-center" style={{ color: 'rgba(17,17,17,0.35)' }}>
            Payments via Locus · Base chain · ERC-8004 identity · Pantera Labs 2026
          </p>
        </motion.div>

        {/* Footer line */}
        <motion.div className="w-px h-12 bg-[#DADADA] mx-auto mt-12"
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.5, delay: 1 }} style={{ originY: 0 }} />
      </div>
    </div>
  )
}
