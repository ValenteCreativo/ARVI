'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function WaitlistPage() {
  const [email, setEmail]   = useState('')
  const [type, setType]     = useState<'sensor' | 'agent' | 'gov' | null>(null)
  const [done, setDone]     = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !type) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setDone(true)
    setLoading(false)
  }

  const OPTS = [
    { id: 'sensor' as const, sym: '○', label: 'Buy a Sensor', sub: 'Deploy a node, earn USDC monthly', color: '#7d6b2e' },
    { id: 'agent'  as const, sym: '⬡', label: 'Connect Your Agent', sub: 'Process data tasks, earn on Base', color: '#5e72e4' },
    { id: 'gov'    as const, sym: '🏛', label: 'Gov & NGO Access', sub: 'Direct intelligence feed + alerts', color: '#7B2FFF' },
  ]

  const sel = OPTS.find(o => o.id === type)

  return (
    <main className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Mono', monospace", background: '#F7F7F7' }}>
      {/* Nav */}
      <nav className="px-8 py-5 flex items-center justify-between border-b" style={{ borderColor: '#E5E5E5', background: 'rgba(247,247,247,0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" className="font-mono text-sm font-bold tracking-widest uppercase" style={{ color: '#2E7D6B' }}>ARVI</Link>
        <Link href="/" className="font-mono text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>← Back</Link>
      </nav>

      {/* Grid texture */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(17,17,17,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-px h-12 mx-auto mb-8" style={{ background: '#DADADA' }} />
            <p className="font-mono text-xs tracking-[0.4em] uppercase font-semibold mb-3" style={{ color: '#2E7D6B' }}>ARVI Network</p>
            <h1 className="font-serif text-4xl leading-tight mb-3" style={{ color: '#111' }}>Join the waitlist.</h1>
            <p className="font-mono text-sm" style={{ color: 'rgba(17,17,17,0.55)' }}>
              Be first to access the environmental intelligence network.
            </p>
          </motion.div>

          {done ? (
            <motion.div className="rounded-2xl border p-8 text-center"
              style={{ background: 'white', borderColor: '#2E7D6B40' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-4xl mb-4">🌿</div>
              <h2 className="font-serif text-2xl mb-2" style={{ color: '#111' }}>You&apos;re on the list.</h2>
              <p className="font-mono text-sm" style={{ color: 'rgba(17,17,17,0.55)' }}>
                We&apos;ll reach out as soon as {
                  type === 'sensor' ? 'sensor kits ship to your region' :
                  type === 'gov'    ? 'we open the Gov & NGO program' :
                  'the agent network opens for new members'
                }.
              </p>
              <Link href="/" className="inline-block mt-6 font-mono text-sm font-semibold px-6 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: '#2E7D6B', color: 'white' }}>
                ← Back to ARVI
              </Link>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleSubmit} className="flex flex-col gap-4"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

              {/* Type selector */}
              <div className="flex flex-col gap-2">
                {OPTS.map(opt => (
                  <button key={opt.id} type="button"
                    onClick={() => setType(opt.id)}
                    className="w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-all hover:scale-[1.01]"
                    style={{
                      background: type === opt.id ? `${opt.color}08` : 'white',
                      borderColor: type === opt.id ? opt.color : '#E5E5E5',
                    }}>
                    <span className="text-xl shrink-0">{opt.sym}</span>
                    <div>
                      <p className="font-mono text-sm font-semibold" style={{ color: type === opt.id ? opt.color : '#111' }}>{opt.label}</p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: 'rgba(17,17,17,0.50)' }}>{opt.sub}</p>
                    </div>
                    {type === opt.id && (
                      <span className="ml-auto font-mono text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: opt.color, color: 'white' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Email */}
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required
                className="w-full rounded-xl border px-5 py-3 font-mono text-sm outline-none transition-all"
                style={{ background: 'white', borderColor: '#E5E5E5', color: '#111' }}
              />

              <motion.button type="submit" disabled={!email || !type || loading}
                className="w-full py-3.5 rounded-xl font-mono text-sm font-bold transition-all"
                style={{
                  background: email && type ? (sel?.color ?? '#2E7D6B') : '#DADADA',
                  color: email && type ? 'white' : 'rgba(17,17,17,0.35)',
                  cursor: email && type ? 'pointer' : 'not-allowed',
                }}
                whileHover={email && type ? { scale: 1.02 } : {}}
                whileTap={email && type ? { scale: 0.98 } : {}}>
                {loading ? 'Joining…' : 'Join the waitlist →'}
              </motion.button>

              <p className="font-mono text-xs text-center" style={{ color: 'rgba(17,17,17,0.35)' }}>
                No spam. No account required. First access when ready.
              </p>
            </motion.form>
          )}

          <div className="w-px h-12 mx-auto mt-10" style={{ background: '#DADADA' }} />
          <p className="font-mono text-xs text-center mt-4" style={{ color: 'rgba(17,17,17,0.35)' }}>
            ERC-8004 · Base Mainnet · Pantera Labs 2026
          </p>
        </div>
      </div>
    </main>
  )
}
