'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ARVI_NODES, type NodeData } from '@/data/nodes'

// ─── Pipeline stage ───────────────────────────────────────────────────────────
type PipelineStage = 'idle' | 'sense' | 'analyze' | 'act' | 'pay' | 'done'

const PIPELINE = [
  { id: 'sense',   sym: '◎', label: 'Sense',   desc: 'Node data received' },
  { id: 'analyze', sym: '◈', label: 'Analyze', desc: 'LLM classification' },
  { id: 'act',     sym: '▸', label: 'Act',     desc: 'Alert published' },
  { id: 'pay',     sym: '○', label: 'Pay',     desc: 'USDC to operator' },
]

const STAGE_ORDER: PipelineStage[] = ['idle', 'sense', 'analyze', 'act', 'pay', 'done']

function getHealthColor(score: number) {
  if (score < 0.4) return '#FF5C3A'
  if (score < 0.7) return '#FFC64D'
  return '#5CFFD0'
}

function getStatusLabel(node: NodeData) {
  if (node.anomaly_detected) return 'CRITICAL'
  if (node.health_score < 0.7) return 'MONITORING'
  return 'NOMINAL'
}

// ─── Telemetry row ────────────────────────────────────────────────────────────
function TelemetryRow({ label, value, unit, color }: {
  label: string; value: string | number; unit?: string; color?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
      <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{label}</span>
      <span className="font-mono text-xs" style={{ color: color || '#F0EDE8' }}>
        {value}<span className="text-white/30 ml-1">{unit}</span>
      </span>
    </div>
  )
}

// ─── Agent Log ────────────────────────────────────────────────────────────────
interface LogEntry {
  ts: string
  type: string
  msg: string
  color: string
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNode, setActiveNode] = useState<NodeData>(ARVI_NODES[0])
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState<PipelineStage>('idle')
  const [log, setLog] = useState<LogEntry[]>([
    { ts: '06:47:00', type: 'INIT',     msg: 'ARVI network online — 6 EVVM contracts deployed', color: '#5CFFD0' },
    { ts: '07:04:00', type: 'IDENTITY', msg: 'ERC-8004 registered — Base Mainnet · 0xb8623d...', color: '#A78BFA' },
    { ts: '07:24:00', type: 'ANALYSIS', msg: 'Chapultepec plague confirmed — 95% confidence', color: '#FF5C3A' },
    { ts: '07:24:01', type: 'PAYMENT',  msg: '9 USDC → 0x7099...79C8 via Locus', color: '#5CFFD0' },
  ])
  const [now, setNow] = useState('')

  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().replace('T', ' ').slice(0, 19))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const networkHealth = ARVI_NODES.reduce((a, n) => a + n.health_score, 0) / ARVI_NODES.length
  const alertCount = ARVI_NODES.filter(n => n.anomaly_detected).length

  const addLog = (type: string, msg: string, color: string) => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [{ ts, type, msg, color }, ...prev].slice(0, 20))
  }

  const runAgent = async () => {
    if (loading) return
    setLoading(true)
    setStage('sense')
    addLog('SENSE', `Data received from ${activeNode.node_id} — ${activeNode.location}`, '#5CFFD0')

    await new Promise(r => setTimeout(r, 600))
    setStage('analyze')
    addLog('ANALYZE', `LLM analysis initiated — model: gemini-2.5-flash`, '#A78BFA')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: activeNode.node_id }),
      })
      const data = await res.json()
      setResults(prev => ({ ...prev, [activeNode.node_id]: data }))

      setStage('act')
      const analysis = data.analysis as Record<string, unknown>
      addLog('ACT', `${String(analysis?.severity ?? '').toUpperCase()} — ${String(analysis?.alert_type ?? '')} — conf. ${((analysis?.confidence as number ?? 0) * 100).toFixed(0)}%`,
        analysis?.severity === 'critical' ? '#FF5C3A' : '#FFC64D')

      await new Promise(r => setTimeout(r, 500))
      setStage('pay')
      const payment = data.payment as Record<string, unknown>
      if (payment) {
        addLog('PAY', `${String(payment.amount_usdc ?? 0)} USDC → ${String(payment.recipient ?? '').slice(0, 14)}... via Locus`, '#5CFFD0')
      }

      await new Promise(r => setTimeout(r, 400))
      setStage('done')
    } catch (e) {
      addLog('ERROR', String(e), '#FF5C3A')
    } finally {
      setLoading(false)
      setTimeout(() => setStage('idle'), 1500)
    }
  }

  const result = results[activeNode.node_id] as Record<string, unknown> | undefined
  const analysis = result?.analysis as Record<string, unknown> | undefined
  const payment = result?.payment as Record<string, unknown> | undefined
  const color = getHealthColor(activeNode.health_score)

  return (
    <div className="min-h-screen bg-void text-parchment flex flex-col">

      {/* ─── TOP BAR ─── */}
      <header className="shrink-0 border-b border-white/5 bg-void/95 backdrop-blur-md">
        <div className="px-6 h-14 flex items-center justify-between max-w-full">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors">← Back</Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-aqua text-sm">◈</span>
              <span className="font-mono text-sm text-parchment/80">ARVI — Network Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-white/30">
              <span className={`w-1.5 h-1.5 rounded-full ${alertCount > 0 ? 'bg-terra animate-pulse' : 'bg-aqua'}`} />
              <span>{alertCount > 0 ? `${alertCount} ALERT${alertCount > 1 ? 'S' : ''}` : 'NOMINAL'}</span>
            </div>
            <span className="text-white/20 hidden md:block font-mono">{now} UTC</span>
            <Link href="/atlas" className="text-white/30 hover:text-aqua/60 transition-colors hidden md:block">Atlas ◎</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT PANEL — Node list ─── */}
        <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">
              Network · {ARVI_NODES.length} nodes · CDMX
            </p>
          </div>

          {/* Network health bar */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Network Health</span>
              <span className="font-mono text-sm font-bold" style={{ color: getHealthColor(networkHealth) }}>
                {(networkHealth * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${networkHealth * 100}%`, background: getHealthColor(networkHealth) }}
              />
            </div>
          </div>

          {/* Node list */}
          <div className="flex-1 overflow-y-auto">
            {ARVI_NODES.map(node => {
              const nc = getHealthColor(node.health_score)
              const isActive = node.node_id === activeNode.node_id
              return (
                <button
                  key={node.node_id}
                  onClick={() => setActiveNode(node)}
                  className={`w-full text-left px-4 py-4 border-b border-white/5 transition-all ${
                    isActive ? 'bg-aqua/5 border-l-2' : 'hover:bg-white/[0.02]'
                  }`}
                  style={isActive ? { borderLeftColor: nc } : {}}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-white/40">{node.ens}</span>
                    <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: nc, background: nc + '15', border: `1px solid ${nc}30` }}>
                      {getStatusLabel(node)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-parchment/70 mb-2 leading-snug">{node.location.split(',')[0]}</div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${node.health_score * 100}%`, background: nc }} />
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: nc }}>
                      {(node.health_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Identity footer */}
          <div className="px-4 py-3 border-t border-white/5">
            <p className="font-mono text-[9px] text-white/15 leading-relaxed">
              Agent: Pantera<br />
              <a href="https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a"
                target="_blank" rel="noopener" className="underline hover:text-aqua/30">
                ERC-8004 on Base ↗
              </a>
            </p>
          </div>
        </aside>

        {/* ─── CENTER — Telemetry + Analysis ─── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Node header */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] text-white/25 mb-1 uppercase tracking-widest">{activeNode.ens}</div>
              <div className="font-mono text-base text-parchment">{activeNode.location}</div>
              <div className="font-mono text-[10px] text-white/25 mt-0.5">{activeNode.dominant_species} · {activeNode.trees_monitored} trees monitored</div>
            </div>
            <button
              onClick={runAgent}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-mono text-sm font-bold transition-all ${
                loading
                  ? 'opacity-50 cursor-not-allowed border border-aqua/20 text-aqua/40'
                  : 'bg-aqua/10 border border-aqua/30 text-aqua hover:bg-aqua/20'
              }`}
            >
              {loading
                ? <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-aqua/40 border-t-aqua rounded-full animate-spin" />
                    Running...
                  </span>
                : '▸ Run ARVI Agent'
              }
            </button>
          </div>

          {/* Telemetry grid */}
          <div className="grid grid-cols-4 gap-px border-b border-white/5">
            {[
              { l: 'Health Score', v: (activeNode.health_score * 100).toFixed(0), u: '%', c: color },
              { l: 'Temperature',  v: activeNode.temperature_c, u: '°C', c: activeNode.temperature_c > 30 ? '#FF5C3A' : '#F0EDE8' },
              { l: 'Humidity',     v: activeNode.humidity_pct, u: '%', c: activeNode.humidity_pct < 35 ? '#FFC64D' : '#F0EDE8' },
              { l: 'CO₂',          v: activeNode.co2_ppm, u: 'ppm', c: '#F0EDE8' },
            ].map(m => (
              <div key={m.l} className="px-5 py-4 bg-surface/30">
                <div className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-2">{m.l}</div>
                <div className="font-serif text-3xl" style={{ color: m.c }}>{m.v}</div>
                <div className="font-mono text-[10px] text-white/30 mt-1">{m.u}</div>
              </div>
            ))}
          </div>

          {/* Analysis result */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeNode.anomaly_detected && !analysis && (
              <div className="rounded-xl border border-terra/30 bg-terra/5 p-4">
                <div className="font-mono text-xs text-terra font-bold mb-1 uppercase tracking-wider">Anomaly Flagged</div>
                <div className="font-mono text-sm text-parchment/60">{(activeNode.anomaly_type || '').replace(/_/g, ' ')} detected on node</div>
                <div className="font-mono text-[10px] text-white/25 mt-2">▸ Run agent above to trigger analysis</div>
              </div>
            )}

            <AnimatePresence>
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Analysis card */}
                  <div className="rounded-xl bg-surface border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">Agent Analysis</span>
                      <span className="font-mono text-[10px]" style={{ color }}>
                        {String(analysis.model_used ?? '')} · conf. {((analysis.confidence as number ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                          style={{ color, background: color + '20', border: `1px solid ${color}30` }}>
                          {String(analysis.severity ?? '').toUpperCase()} — {String(analysis.alert_type ?? '')}
                        </span>
                      </div>
                      <p className="text-sm text-parchment/60 font-sans leading-relaxed">{String(analysis.description ?? '')}</p>
                      <div className="font-mono text-xs text-aqua/60 italic">▸ {String(analysis.recommended_action ?? '')}</div>
                    </div>
                  </div>

                  {/* Payment card */}
                  {payment && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl border border-aqua/15 bg-aqua/5 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] text-aqua uppercase tracking-wider">○ Payment Executed</span>
                        <span className="font-mono text-sm text-aqua font-bold">{String((payment as Record<string, unknown>).amount_usdc ?? 0)} USDC</span>
                      </div>
                      <div className="font-mono text-[10px] text-white/30">
                        {String((payment as Record<string, unknown>).recipient ?? '').slice(0, 18)}... via Locus
                        {Boolean((payment as Record<string, unknown>).simulated) && (
                          <span className="text-solar/40 ml-2">(simulation)</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Telemetry details */}
            <div className="rounded-xl bg-surface border border-white/5 p-4">
              <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-3">Sensor Readings</p>
              <TelemetryRow label="Node ID" value={activeNode.node_id} color="#A78BFA" />
              <TelemetryRow label="Zone" value={activeNode.zone} />
              <TelemetryRow label="Species" value={activeNode.dominant_species} color="#5CFFD0" />
              <TelemetryRow label="Timestamp" value={new Date(activeNode.timestamp).toISOString().slice(11, 19)} unit="UTC" />
              <TelemetryRow label="Operator" value={activeNode.operator_wallet.slice(0, 16) + '...'} color="#A78BFA" />
            </div>
          </div>
        </main>

        {/* ─── RIGHT PANEL — Pipeline + Log ─── */}
        <aside className="w-72 shrink-0 border-l border-white/5 flex flex-col">

          {/* Pipeline */}
          <div className="p-4 border-b border-white/5">
            <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest mb-4">Agent Pipeline</p>
            <div className="space-y-2">
              {PIPELINE.map((p, i) => {
                const stageIdx = STAGE_ORDER.indexOf(stage)
                const pipeIdx = i + 1
                const isActive = stageIdx === pipeIdx
                const isDone = stageIdx > pipeIdx || stage === 'done'
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.2 : 1,
                          boxShadow: isActive ? '0 0 16px rgba(92,255,208,0.5)' : 'none',
                        }}
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-mono text-sm transition-all"
                        style={{
                          borderColor: isDone ? '#5CFFD0' : isActive ? '#5CFFD0' : 'rgba(255,255,255,0.1)',
                          background: isDone ? '#5CFFD020' : isActive ? '#5CFFD015' : 'transparent',
                          color: isDone || isActive ? '#5CFFD0' : 'rgba(255,255,255,0.2)',
                        }}
                      >
                        {isDone ? '✓' : p.sym}
                      </motion.div>
                      {i < PIPELINE.length - 1 && (
                        <div className="w-px h-4 my-0.5" style={{ background: isDone ? '#5CFFD030' : 'rgba(255,255,255,0.05)' }} />
                      )}
                    </div>
                    <div>
                      <div className="font-mono text-xs" style={{ color: isActive || isDone ? '#F0EDE8' : 'rgba(240,237,232,0.3)' }}>
                        {p.label}
                      </div>
                      <div className="font-mono text-[10px] text-white/20">{p.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Agent Log */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <p className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Execution Log</p>
              <a href="https://github.com/ValenteCreativo/ARVI/blob/main/agent_log.json"
                target="_blank" rel="noopener"
                className="font-mono text-[10px] text-white/15 hover:text-aqua/40 transition-colors">
                raw ↗
              </a>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {log.map((entry, i) => (
                  <motion.div
                    key={`${entry.ts}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="font-mono text-[10px] leading-relaxed"
                  >
                    <span className="text-white/20">[{entry.ts}]</span>
                    {' '}
                    <span className="font-bold" style={{ color: entry.color }}>{entry.type}</span>
                    {' '}
                    <span className="text-white/40">{entry.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
