'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [type, setType]   = useState<'sensor' | 'agent' | null>(null)
  const [done, setDone]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !type) return
    setLoading(true)
    // Simulate join (replace with real endpoint when ready)
    await new Promise(r => setTimeout(r, 900))
    setDone(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{ background: '#0A0B14', fontFamily: "'DM Mono', monospace" }}>

      {/* Grid texture */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Logo */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs tracking-[0.4em] uppercase font-semibold" style={{ color: '#2E7D6B' }}>ARVI Network</p>
          <h1 className="font-serif text-4xl mt-2 leading-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>
            Join the waitlist.
          </h1>
          <p className="font-mono text-sm mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Be first to access the environmental intelligence network.
          </p>
        </motion.div>

        {done ? (
          <motion.div className="rounded-2xl border p-8"
            style={{ background: 'rgba(46,125,107,0.08)', borderColor: '#2E7D6B40' }}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="text-4xl mb-3">🌿</div>
            <h2 className="font-serif text-2xl mb-2" style={{ color: 'rgba(255,255,255,0.90)' }}>You&apos;re on the list.</h2>
            <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>We&apos;ll reach out as soon as {type === 'sensor' ? 'sensor kits ship to your region' : 'the agent network opens for new members'}.</p>
          </motion.div>
        ) : (
          <motion.form onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'sensor' as const, sym: '○', label: 'Buy a Sensor', sub: 'Deploy a node, earn USDC' },
                { id: 'agent'  as const, sym: '⬡', label: 'Connect Agent', sub: 'Process data, earn rewards' },
              ].map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => setType(opt.id)}
                  className="rounded-xl border p-4 text-left transition-all hover:scale-[1.02]"
                  style={{
                    background: type === opt.id ? 'rgba(46,125,107,0.12)' : 'rgba(255,255,255,0.03)',
                    borderColor: type === opt.id ? '#2E7D6B' : 'rgba(255,255,255,0.10)',
                  }}>
                  <p className="font-mono text-xl mb-2" style={{ color: '#2E7D6B' }}>{opt.sym}</p>
                  <p className="font-mono text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{opt.label}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{opt.sub}</p>
                </button>
              ))}
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border px-5 py-3 font-mono text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
              }}
            />

            <motion.button type="submit" disabled={!email || !type || loading}
              className="w-full py-3.5 rounded-xl font-mono text-sm font-bold transition-all"
              style={{
                background: email && type ? '#2E7D6B' : 'rgba(255,255,255,0.06)',
                color: email && type ? 'white' : 'rgba(255,255,255,0.25)',
                cursor: email && type ? 'pointer' : 'not-allowed',
              }}
              whileHover={email && type ? { scale: 1.02 } : {}}
              whileTap={email && type ? { scale: 0.98 } : {}}>
              {loading ? 'Joining…' : 'Join the waitlist →'}
            </motion.button>

            <p className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No spam. No account required. We&apos;ll only reach out when it&apos;s ready.
            </p>
          </motion.form>
        )}

        <motion.a href="/" className="inline-block mt-8 font-mono text-xs"
          style={{ color: 'rgba(255,255,255,0.30)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          ← Back to ARVI
        </motion.a>
      </div>
    </main>
  )
}
