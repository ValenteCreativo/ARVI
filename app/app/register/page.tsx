import Link from 'next/link'

export default function RegisterSensor() {
  return (
    <div className="min-h-screen bg-[#060a07] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060a07]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#01f094]/10 border border-[#01f094]/30 flex items-center justify-center">
              <span className="text-xs">🌿</span>
            </div>
            <span className="font-bold tracking-tight text-white">ARVI</span>
          </Link>
          <Link href="/dashboard" className="text-xs px-4 py-2 rounded-lg bg-[#01f094] text-black font-bold hover:bg-[#01f094]/90 transition-all">
            Launch App →
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-40 pb-24">

        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono text-[#01f094]/60 mb-3 tracking-widest uppercase">Node Registration</div>
          <h1 className="text-4xl font-black mb-3">Register a Sensor Node</h1>
          <p className="text-white/40 leading-relaxed">
            Deploy a monitoring node in your urban forest area and earn USDC rewards
            every time ARVI confirms an environmental threat through your data.
          </p>
        </div>

        {/* How it pays */}
        <div className="rounded-2xl border border-[#01f094]/15 bg-[#01f094]/[0.03] p-6 mb-8">
          <h3 className="text-[#01f094] font-bold text-sm mb-4">💸 How Operator Rewards Work</h3>
          <ul className="space-y-2 text-sm text-white/50">
            <li className="flex items-start gap-2"><span className="text-[#01f094] shrink-0">1.</span>Your node sends raw sensor data to the ARVI network</li>
            <li className="flex items-start gap-2"><span className="text-[#01f094] shrink-0">2.</span>ARVI&apos;s agent analyzes the data with AI</li>
            <li className="flex items-start gap-2"><span className="text-[#01f094] shrink-0">3.</span>When a verified anomaly is detected, you earn 6–12 USDC automatically</li>
            <li className="flex items-start gap-2"><span className="text-[#01f094] shrink-0">4.</span>Payment is triggered via Locus — no invoice, no waiting, fully onchain</li>
          </ul>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 space-y-6">
          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
              Operator Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bosque de Chapultepec Observer"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#01f094]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
              Forest Location
            </label>
            <input
              type="text"
              placeholder="e.g. Bosque de Chapultepec, CDMX"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#01f094]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
              Wallet Address (for USDC rewards)
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-[#01f094]/40 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
              Sensor Type
            </label>
            <select className="w-full bg-[#060a07] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 focus:outline-none focus:border-[#01f094]/40 transition-colors">
              <option>Environmental (temp + humidity + soil)</option>
              <option>Visual (camera + thermal)</option>
              <option>Multi-modal (full stack)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
              ENS Name (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. chapultepec-02.arvi.eth"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-white/20 focus:outline-none focus:border-[#01f094]/40 transition-colors"
            />
          </div>

          <button
            className="w-full py-4 rounded-xl bg-[#01f094] text-black font-bold text-sm hover:bg-[#01f094]/90 transition-all shadow-[0_0_30px_rgba(1,240,148,0.15)]"
          >
            Submit Registration →
          </button>

          <p className="text-xs text-white/20 text-center">
            Registration is reviewed within 24h. You&apos;ll receive your node credentials via email.
          </p>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Back to ARVI
          </Link>
        </div>
      </div>
    </div>
  )
}
