'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ARVI_NODES, type NodeData } from '@/data/nodes'

export default function Dashboard() {
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState<string | null>(null)

  const analyzeNode = async (node_id: string) => {
    setLoading(node_id)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id })
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [node_id]: data }))
    } catch (e) {
      setResults(prev => ({ ...prev, [node_id]: { error: String(e) } }))
    } finally {
      setLoading(null)
    }
  }

  const getStatusColor = (score: number) => {
    if (score < 0.4) return 'border-red-500/30 bg-red-500/5'
    if (score < 0.7) return 'border-yellow-500/30 bg-yellow-500/5'
    return 'border-[#01f094]/20 bg-[#01f094]/5'
  }

  const getScoreColor = (score: number) => {
    if (score < 0.4) return 'text-red-400'
    if (score < 0.7) return 'text-yellow-400'
    return 'text-[#01f094]'
  }

  const getStatusLabel = (node: NodeData) => {
    if (node.anomaly_detected) return { label: 'ALERT', color: 'text-red-400 bg-red-500/10 border-red-500/20' }
    if (node.health_score < 0.7) return { label: 'MONITORING', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' }
    return { label: 'HEALTHY', color: 'text-[#01f094] bg-[#01f094]/10 border-[#01f094]/20' }
  }

  const networkHealth = ARVI_NODES.reduce((acc, n) => acc + n.health_score, 0) / ARVI_NODES.length
  const alertCount = ARVI_NODES.filter(n => n.anomaly_detected).length

  return (
    <div className="min-h-screen bg-[#060a07] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#060a07]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors">
              ← Back
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#01f094]/10 border border-[#01f094]/30 flex items-center justify-center">
                <span className="text-xs">🌿</span>
              </div>
              <span className="font-bold text-sm">ARVI Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-white/30">
              <span className={`w-1.5 h-1.5 rounded-full ${alertCount > 0 ? 'bg-red-400 animate-pulse' : 'bg-[#01f094]'}`} />
              {alertCount > 0 ? `${alertCount} alert${alertCount > 1 ? 's' : ''}` : 'All systems normal'}
            </div>
            <a
              href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json"
              target="_blank" rel="noopener"
              className="text-white/25 hover:text-white/50 transition-colors"
            >
              Agent Log ↗
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">

        {/* Header + Network Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-mono text-[#01f094]/60 mb-1 tracking-widest uppercase">Pantera Agent · Base Mainnet</div>
            <h1 className="text-2xl font-black">Network Intelligence</h1>
            <p className="text-white/30 text-xs mt-1">
              Autonomous monitoring · 3 nodes · CDMX Urban Forest
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-white/25 font-mono">Network Health</div>
              <div className={`text-2xl font-black ${getScoreColor(networkHealth)}`}>
                {(networkHealth * 100).toFixed(0)}%
              </div>
            </div>
            <div className="w-px h-10 bg-white/5" />
            <div className="text-right">
              <div className="text-xs text-white/25 font-mono">Active Alerts</div>
              <div className={`text-2xl font-black ${alertCount > 0 ? 'text-red-400' : 'text-[#01f094]'}`}>
                {alertCount}
              </div>
            </div>
          </div>
        </div>

        {/* Node Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {ARVI_NODES.map(node => {
            const result = results[node.node_id] as Record<string, unknown> | undefined
            const analysis = result?.analysis as Record<string, unknown> | undefined
            const payment = result?.payment as Record<string, unknown> | undefined
            const status = getStatusLabel(node)

            return (
              <div
                key={node.node_id}
                className={`rounded-2xl border p-6 transition-all ${getStatusColor(node.health_score)}`}
              >
                {/* Node header */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="text-xs text-white/25 font-mono mb-1">{node.ens}</div>
                    <div className="font-bold text-white">{node.location}</div>
                    <div className="text-xs text-white/30 mt-0.5">{node.node_id}</div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-bold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-white/25 mb-1">Health Score</div>
                    <div className={`text-2xl font-black font-mono ${getScoreColor(node.health_score)}`}>
                      {(node.health_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-white/25 mb-1">Trees</div>
                    <div className="text-2xl font-black font-mono text-white/70">{node.trees_monitored}</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-white/25 mb-1">Temp</div>
                    <div className="text-lg font-mono text-white/60">{node.temperature_c}°C</div>
                  </div>
                  <div className="bg-black/20 rounded-xl p-3">
                    <div className="text-xs text-white/25 mb-1">Humidity</div>
                    <div className="text-lg font-mono text-white/60">{node.humidity_pct}%</div>
                  </div>
                </div>

                {/* Anomaly alert */}
                {node.anomaly_detected && (
                  <div className="bg-red-950/40 border border-red-500/20 rounded-xl p-3 text-xs text-red-300 mb-4">
                    <span className="font-bold">⚠ {node.anomaly_type?.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="text-red-400/60 ml-2">— Awaiting agent analysis</span>
                  </div>
                )}

                {/* Analyze button */}
                <button
                  onClick={() => analyzeNode(node.node_id)}
                  disabled={!!loading}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all
                    ${loading === node.node_id
                      ? 'bg-[#01f094]/5 border border-[#01f094]/20 text-[#01f094]/50 cursor-not-allowed'
                      : 'bg-[#01f094]/10 border border-[#01f094]/25 text-[#01f094] hover:bg-[#01f094]/20 hover:border-[#01f094]/40'
                    }`}
                >
                  {loading === node.node_id
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-[#01f094]/40 border-t-[#01f094] rounded-full animate-spin" />
                        Analyzing with AI...
                      </span>
                    : '▶  Run ARVI Agent'
                  }
                </button>

                {/* Analysis result */}
                {analysis && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                      <div className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                        String(analysis.severity) === 'critical' ? 'text-red-400' :
                        String(analysis.severity) === 'high' ? 'text-orange-400' :
                        String(analysis.severity) === 'medium' ? 'text-yellow-400' : 'text-[#01f094]'
                      }`}>
                        {String(analysis.severity)} — {String(analysis.alert_type)}
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed mb-2">
                        {String(analysis.description)}
                      </p>
                      <p className="text-xs text-[#01f094]/60 italic">
                        → {String(analysis.recommended_action)}
                      </p>
                      <div className="text-xs text-white/20 mt-2 font-mono">
                        Confidence: {((analysis.confidence as number ?? 0) * 100).toFixed(0)}% · {String(analysis.model_used ?? '')}
                      </div>
                    </div>

                    {payment && (
                      <div className="bg-green-950/30 border border-green-500/15 rounded-xl p-3">
                        <div className="text-green-400 font-bold text-xs mb-1">💸 Payment Triggered</div>
                        <div className="text-white/40 font-mono text-xs">
                          {String((payment as Record<string, unknown>).amount_usdc ?? 0)} USDC
                          {' → '}
                          {String((payment as Record<string, unknown>).recipient ?? '').slice(0, 12)}...
                        </div>
                        {Boolean((payment as Record<string, unknown>).simulated) && (
                          <div className="text-yellow-600/60 text-xs mt-1 font-mono">(simulation — Locus live on mainnet)</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Agent Log */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white/60">Agent Execution Log</h2>
            <a
              href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json"
              target="_blank" rel="noopener"
              className="text-xs text-white/20 hover:text-[#01f094]/50 transition-colors"
            >
              View on GitHub ↗
            </a>
          </div>
          <div className="font-mono text-xs space-y-2">
            <div className="flex items-center gap-3 text-white/40">
              <span className="text-[#01f094]/60 shrink-0">✓</span>
              <span className="text-white/20">2026-03-21T06:47Z</span>
              <span>SYSTEM_INIT — EVVM chain deployed · 6 contracts · chain:31337</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <span className="text-[#01f094]/60 shrink-0">✓</span>
              <span className="text-white/20">2026-03-21T07:04Z</span>
              <span>AGENT_REGISTERED — ERC-8004 identity · Base Mainnet · 0xb8623d...</span>
            </div>
            <div className="flex items-center gap-3 text-white/20">
              <span className="text-white/10 shrink-0">⋯</span>
              <span className="text-white/10">pending</span>
              <span>NODE_DATA_RECEIVED — awaiting agent trigger via dashboard</span>
            </div>
          </div>

          {/* Identity footer */}
          <div className="mt-5 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-white/15">
            <span>Agent: Pantera · participant: d88080a5...</span>
            <a
              href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
              target="_blank" rel="noopener"
              className="underline hover:text-[#01f094]/30 transition-colors"
            >
              ERC-8004 on Base Mainnet ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
