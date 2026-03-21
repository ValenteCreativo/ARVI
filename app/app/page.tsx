'use client'

import { useState } from 'react'
import { ARVI_NODES, type NodeData } from '@/data/nodes'

export default function Home() {
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

  const getHealthColor = (score: number) => {
    if (score < 0.4) return 'text-red-400 border-red-500'
    if (score < 0.7) return 'text-yellow-400 border-yellow-500'
    return 'text-green-400 border-green-500'
  }

  const getStatusDot = (node: NodeData) => {
    if (node.anomaly_detected) return '🔴'
    if (node.health_score < 0.7) return '🟡'
    return '🟢'
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🌿</span>
          <h1 className="text-4xl font-bold" style={{color:'#01f094'}}>ARVI</h1>
          <span className="text-xs px-2 py-1 rounded border border-[#01f094] text-[#01f094] opacity-60">
            Agentic Regeneration Via Intelligence
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Autonomous urban forest intelligence • Base Mainnet • ERC-8004 Identity
        </p>
        <div className="mt-2 text-xs text-gray-600 font-mono">
          Agent: Pantera • Participant: d88080a5... • 
          <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
             target="_blank" rel="noopener"
             className="underline hover:text-[#01f094] ml-1">
            ERC-8004 on Base ↗
          </a>
        </div>
      </div>

      {/* Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {ARVI_NODES.map(node => {
          const result = results[node.node_id] as Record<string, unknown> | undefined
          const analysis = result?.analysis as Record<string, unknown> | undefined
          const payment = result?.payment as Record<string, unknown> | undefined

          return (
            <div
              key={node.node_id}
              className={`rounded-xl border p-5 bg-[#0d1a12] ${getHealthColor(node.health_score)}`}
            >
              {/* Node header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-gray-500 font-mono">{node.ens}</div>
                  <div className="font-bold text-white text-sm mt-1">{node.location}</div>
                </div>
                <span className="text-2xl">{getStatusDot(node)}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-gray-500">Health Score</div>
                  <div className="font-mono font-bold text-lg">{(node.health_score * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-gray-500">Trees</div>
                  <div className="font-mono font-bold text-lg">{node.trees_monitored}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-gray-500">Temp</div>
                  <div className="font-mono">{node.temperature_c}°C</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-gray-500">Humidity</div>
                  <div className="font-mono">{node.humidity_pct}%</div>
                </div>
              </div>

              {node.anomaly_detected && (
                <div className="bg-red-950/50 border border-red-800 rounded p-2 text-xs text-red-300 mb-3">
                  ⚠️ {node.anomaly_type?.replace('_', ' ').toUpperCase()} detected
                </div>
              )}

              {/* Analyze button */}
              <button
                onClick={() => analyzeNode(node.node_id)}
                disabled={loading === node.node_id}
                className="w-full py-2 px-4 rounded text-xs font-bold transition-all
                           bg-[#01f094]/10 border border-[#01f094]/30 text-[#01f094]
                           hover:bg-[#01f094]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === node.node_id ? '🤖 Analyzing...' : '▶ Run ARVI Agent'}
              </button>

              {/* Analysis result */}
              {analysis && (
                <div className="mt-3 text-xs space-y-2">
                  <div className="bg-black/40 rounded p-2 border border-[#01f094]/20">
                    <div className="text-[#01f094] font-bold mb-1">
                      🤖 {String(analysis.severity ?? '').toUpperCase()} — {String(analysis.alert_type ?? '')}
                    </div>
                    <div className="text-gray-300">{String(analysis.description ?? '')}</div>
                    <div className="text-[#01f094]/70 mt-1 italic">{String(analysis.recommended_action ?? '')}</div>
                  </div>

                  {payment && (
                    <div className="bg-green-950/50 border border-green-700 rounded p-2">
                      <div className="text-green-400 font-bold">💸 Payment Triggered</div>
                      <div className="text-gray-400 font-mono text-xs">
                          {`${(payment as Record<string, unknown>).amount_usdc ?? 0} USDC → ${String((payment as Record<string, unknown>).recipient ?? '').slice(0, 10)}...`}
                      </div>
                      {Boolean((payment as Record<string, unknown>).simulated) && (
                        <div className="text-yellow-600 text-xs">(simulated — Locus live on deploy)</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Agent log preview */}
      <div className="rounded-xl border border-gray-800 bg-[#0d1a12] p-5">
        <h2 className="text-[#01f094] font-bold mb-3 text-sm">📋 Agent Execution Log</h2>
        <div className="font-mono text-xs text-gray-400 space-y-1">
          <div>✅ [2026-03-21T06:47Z] SYSTEM_INIT — EVVM chain deployed (31337)</div>
          <div>✅ [2026-03-21T07:04Z] AGENT_REGISTERED — ERC-8004 on Base Mainnet</div>
          <div className="text-gray-600">⏳ [pending] NODE_DATA_RECEIVED — awaiting agent trigger</div>
          <div className="text-gray-600">⏳ [pending] LLM_ANALYSIS — Bankr analysis</div>
          <div className="text-gray-600">⏳ [pending] LOCUS_PAYMENT — operator reward</div>
        </div>
        <div className="mt-3 text-xs">
          <a href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json"
             target="_blank" rel="noopener"
             className="text-[#01f094]/60 hover:text-[#01f094] underline">
            View full agent_log.json on GitHub ↗
          </a>
        </div>
      </div>
    </main>
  )
}
