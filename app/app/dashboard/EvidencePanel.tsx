'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { AgentEvent } from './LiveAgentEvent'

export default function EvidencePanel({
  event,
  open,
  onClose,
  darkMode,
}: {
  event: AgentEvent | null
  open: boolean
  onClose: () => void
  darkMode?: boolean
}) {
  if (!event) return null

  const bg = darkMode ? '#0F1020' : '#FAFAF8'
  const borderC = darkMode ? 'rgba(255,255,255,0.1)' : '#E5E5E5'
  const textPrimary = darkMode ? '#E8E8E8' : '#1a1a1a'
  const textMuted = darkMode ? 'rgba(255,255,255,0.4)' : '#888'
  const textDim = darkMode ? 'rgba(255,255,255,0.25)' : '#bbb'
  const sectionBg = darkMode ? 'rgba(255,255,255,0.03)' : '#f5f5f3'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          />

          {/* Panel — desktop: right slide, mobile: full screen */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full z-50 w-full sm:w-[480px] overflow-y-auto"
            style={{ background: bg, borderLeft: `1px solid ${borderC}` }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-4 border-b flex items-center justify-between"
              style={{ background: bg, borderColor: borderC }}>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest font-semibold" style={{ color: textMuted }}>
                  Evidence
                </p>
                <p className="font-mono text-[11px] mt-0.5" style={{ color: textPrimary }}>
                  {event.timestamp.slice(0, 19).replace('T', ' ')} UTC
                </p>
              </div>
              <button onClick={onClose}
                className="font-mono text-[11px] px-3 py-1.5 rounded-lg border transition-all hover:opacity-70"
                style={{ color: textMuted, borderColor: borderC }}>
                Close ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* RAW DATA INPUT */}
              <Section title="RAW DATA INPUT" bg={sectionBg} borderColor={borderC} textMuted={textMuted}>
                <Row label="node_id" value={event.node_id} color={textPrimary} muted={textMuted} />
                <Row label="location" value={event.location} color={textPrimary} muted={textMuted} />
                <Row label="temperature_c" value={String(event.temperature_c)} color={textPrimary} muted={textMuted} />
                <Row label="soil_moisture_pct" value={String(event.soil_moisture_pct)} color={textPrimary} muted={textMuted} />
                <Row label="air_quality_index" value={String(event.air_quality_index)} color={textPrimary} muted={textMuted} />
                <Row label="pathogen_risk" value={event.pathogen_risk.toFixed(2)} color={textPrimary} muted={textMuted} />
                <Row label="timestamp" value={event.timestamp} color={textPrimary} muted={textMuted} />
              </Section>

              {/* AGENT ANALYSIS */}
              <Section title="AGENT ANALYSIS" bg={sectionBg} borderColor={borderC} textMuted={textMuted}>
                <Row label="model_used" value={event.model_used} color={textPrimary} muted={textMuted} />
                <Row label="alert_type" value={event.alert_type} color={textPrimary} muted={textMuted} />
                <Row label="severity" value={event.severity} color={
                  event.severity === 'critical' ? '#C0392B' : event.severity === 'high' ? '#E67E22' : textPrimary
                } muted={textMuted} />
                <Row label="confidence" value={event.confidence.toFixed(2)} color={textPrimary} muted={textMuted} />
                <Row label="anomaly_detected" value="true" color={textPrimary} muted={textMuted} />
              </Section>

              {/* DECISION LOGIC */}
              <Section title="DECISION LOGIC" bg={sectionBg} borderColor={borderC} textMuted={textMuted}>
                {event.soil_moisture_pct < 20 && (
                  <>
                    <Row label="Threshold" value="soil_moisture < 20%" color={textPrimary} muted={textMuted} />
                    <Row label="Current" value={`${event.soil_moisture_pct}% → TRIGGERED`} color="#C0392B" muted={textMuted} />
                  </>
                )}
                {event.temperature_c > 30 && (
                  <>
                    <Row label="Threshold" value="temperature > 30°C" color={textPrimary} muted={textMuted} />
                    <Row label="Current" value={`${event.temperature_c}°C → TRIGGERED`} color="#C0392B" muted={textMuted} />
                  </>
                )}
                {event.pathogen_risk > 0.6 && (
                  <>
                    <Row label="Threshold" value="pathogen_risk > 60%" color={textPrimary} muted={textMuted} />
                    <Row label="Current" value={`${(event.pathogen_risk * 100).toFixed(0)}% → TRIGGERED`} color="#C0392B" muted={textMuted} />
                  </>
                )}
                <Row label="Combined" value={`Multi-factor stress (${[
                  event.temperature_c > 30 ? 'temp' : '',
                  event.soil_moisture_pct < 20 ? 'soil' : '',
                  event.pathogen_risk > 0.6 ? 'pathogen' : '',
                  event.air_quality_index > 100 ? 'aqi' : '',
                ].filter(Boolean).join(' + ') || 'single factor'})`} color={textPrimary} muted={textMuted} />
              </Section>

              {/* ACTION TAKEN */}
              <Section title="ACTION TAKEN" bg={sectionBg} borderColor={borderC} textMuted={textMuted}>
                <Row label="action" value="alert_logged" color={textPrimary} muted={textMuted} />
                <Row label="file" value="/alert-log.json" color={textPrimary} muted={textMuted} />
                <Row label="entry_id" value={event.alert_id || 'N/A'} color={textPrimary} muted={textMuted} />
                <Row label="timestamp" value={event.timestamp} color={textPrimary} muted={textMuted} />
                {event.simulated && (
                  <Row label="mode" value="simulation (no Bankr API key)" color="#B85C00" muted={textMuted} />
                )}
              </Section>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={onClose}
                  className="flex-1 font-mono text-[11px] py-2.5 rounded-xl border transition-all hover:opacity-70"
                  style={{ color: textMuted, borderColor: borderC }}>
                  Close
                </button>
                <a href="/alert-log.json" target="_blank" rel="noopener"
                  className="flex-1 font-mono text-[11px] py-2.5 rounded-xl border text-center transition-all hover:opacity-70"
                  style={{ color: '#2E7D6B', borderColor: '#2E7D6B40' }}>
                  View /alert-log.json ↗
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children, bg, borderColor, textMuted }: {
  title: string; children: React.ReactNode; bg: string; borderColor: string; textMuted: string
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor }}>
      <div className="px-4 py-2 border-b" style={{ background: bg, borderColor }}>
        <p className="font-mono text-[9px] uppercase tracking-widest font-bold" style={{ color: textMuted }}>{title}</p>
      </div>
      <div className="p-4 space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value, color, muted }: { label: string; value: string; color: string; muted: string }) {
  return (
    <div className="flex items-start gap-3 font-mono text-[11px]">
      <span className="w-32 shrink-0 text-[10px]" style={{ color: muted }}>{label}</span>
      <span style={{ color }} className="break-all">{value}</span>
    </div>
  )
}
