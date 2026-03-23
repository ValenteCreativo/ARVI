'use client'

import { motion } from 'framer-motion'

export interface AgentEvent {
  node_id: string
  location: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  temperature_c: number
  soil_moisture_pct: number
  air_quality_index: number
  pathogen_risk: number
  timestamp: string
  model_used: string
  simulated: boolean
  alert_id: string
}

const SEVERITY_COLORS: Record<string, string> = {
  low: '#2E7D6B',
  medium: '#B85C00',
  high: '#E67E22',
  critical: '#C0392B',
}

function severityLabel(s: string) {
  return s === 'critical' ? 'CRITICAL' : s === 'high' ? 'HIGH' : s === 'medium' ? 'MEDIUM' : 'LOW'
}

export default function LiveAgentEvent({
  event,
  loading,
  onViewEvidence,
  darkMode,
}: {
  event: AgentEvent | null
  loading: boolean
  onViewEvidence: () => void
  darkMode?: boolean
}) {
  const borderColor = event ? (SEVERITY_COLORS[event.severity] || '#2E7D6B') : '#2E7D6B'

  // Skeleton state
  if (!event && !loading) {
    return (
      <div className={`rounded-2xl border-l-4 p-5 ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-line'}`}
        style={{ borderLeftColor: '#888' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">LIVE AGENT EVENT</span>
          <span className="font-mono text-[9px] text-muted/50">Waiting for first run…</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-3 rounded ${darkMode ? 'bg-white/5' : 'bg-gray-100'} animate-pulse`}
              style={{ width: `${60 + i * 8}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (loading && !event) {
    return (
      <div className={`rounded-2xl border-l-4 p-5 ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-line'}`}
        style={{ borderLeftColor: '#2E7D6B' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-muted uppercase tracking-widest">LIVE AGENT EVENT</span>
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50 bg-[#2E7D6B]" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-[#2E7D6B]" />
            </span>
            <span className="font-mono text-[9px] text-[#2E7D6B]">ANALYZING…</span>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-3 rounded ${darkMode ? 'bg-white/5' : 'bg-gray-100'} animate-pulse`}
              style={{ width: `${60 + i * 8}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!event) return null

  const thresholdSignal = event.soil_moisture_pct < 20
    ? `Soil moisture < 20% → ${event.alert_type.replace(/_/g, ' ')} alert`
    : event.temperature_c > 30
      ? `Temperature > 30°C → heat stress alert`
      : `Multi-factor stress → ${event.alert_type.replace(/_/g, ' ')} alert`

  // Count triggered factors
  const factors: string[] = []
  if (event.temperature_c > 30) factors.push('temp')
  if (event.soil_moisture_pct < 20) factors.push('soil')
  if (event.pathogen_risk > 0.6) factors.push('pathogen')
  if (event.air_quality_index > 100) factors.push('aqi')
  const factorCount = Math.max(factors.length, 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border-l-4 overflow-hidden ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-line'}`}
      style={{ borderLeftColor: borderColor, borderLeftWidth: '4px' }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: borderColor }}>
              LIVE AGENT EVENT
            </span>
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full border"
              style={{ color: borderColor, borderColor: `${borderColor}40`, background: `${borderColor}10` }}>
              {severityLabel(event.severity)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full animate-ping opacity-50 bg-[#2E7D6B]" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-[#2E7D6B]" />
              </span>
              <span className="font-mono text-[9px] text-[#2E7D6B] font-bold">LIVE</span>
            </div>
            <button
              onClick={onViewEvidence}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all hover:border-jade/40"
              style={{ color: '#2E7D6B', borderColor: '#2E7D6B40' }}
            >
              View Evidence ↗
            </button>
          </div>
        </div>

        {/* Event details */}
        <div className="space-y-2.5 font-mono text-[11px]">
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Source</span>
            <span className="text-ink/80">Open-Meteo API + Node {event.node_id}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Signal</span>
            <span className="text-ink/80">{event.description.split('.')[0]}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Value</span>
            <span className="text-ink/80">
              {event.soil_moisture_pct}% moisture · {event.temperature_c}°C canopy · AQI {event.air_quality_index}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Threshold</span>
            <span style={{ color: borderColor }}>{thresholdSignal}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Decision</span>
            <span className="text-ink/80">
              Node reports {factorCount}-factor stress signature. {((event.confidence) * 100).toFixed(0)}% confidence anomaly.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted w-20 shrink-0 text-[10px]">Action</span>
            <span className="text-ink/60">
              Alert logged · /alert-log.json · {event.timestamp.slice(0, 19).replace('T', ' ')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
