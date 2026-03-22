'use client'

import { motion } from 'framer-motion'

interface ThresholdRow {
  icon: string
  label: string
  value: number
  unit: string
  threshold: number
  direction: 'above' | 'below'
  max: number
}

export default function ThresholdPanel({
  temperature,
  soilMoisture,
  aqi,
  pathogenRisk,
  darkMode,
}: {
  temperature: number
  soilMoisture: number
  aqi: number
  pathogenRisk: number
  darkMode?: boolean
}) {
  const rows: ThresholdRow[] = [
    { icon: '🌡', label: 'Temperature', value: temperature, unit: '°C', threshold: 30, direction: 'above', max: 50 },
    { icon: '💧', label: 'Soil Moisture', value: soilMoisture, unit: '%', threshold: 20, direction: 'below', max: 100 },
    { icon: '🌬', label: 'AQI', value: aqi, unit: '', threshold: 100, direction: 'above', max: 300 },
    { icon: '🦠', label: 'Pathogen Risk', value: Math.round(pathogenRisk * 100), unit: '%', threshold: 60, direction: 'above', max: 100 },
  ]

  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-line'}`}>
      <div className={`px-5 py-2.5 border-b ${darkMode ? 'border-white/8' : 'border-line'}`}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">Trigger Conditions</span>
      </div>
      <div className="p-5 space-y-4">
        {rows.map(row => {
          const triggered = row.direction === 'above'
            ? row.value > row.threshold
            : row.value < row.threshold
          const color = triggered ? '#C0392B' : '#2E7D6B'
          const barPct = Math.min((row.value / row.max) * 100, 100)
          const thresholdPct = (row.threshold / row.max) * 100

          // Build 10-segment bar
          const segments = 10
          const filledSegments = Math.round((row.value / row.max) * segments)

          return (
            <div key={row.label}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm w-5 text-center">{row.icon}</span>
                <span className="font-mono text-[11px] text-ink/70 w-28 shrink-0">{row.label}</span>
                <span className="font-mono text-[12px] font-medium w-16 shrink-0" style={{ color }}>
                  {row.value}{row.unit}
                </span>

                {/* Segment bar */}
                <div className="flex gap-0.5 flex-1">
                  {Array.from({ length: segments }).map((_, i) => (
                    <div key={i} className="h-3 flex-1 rounded-sm transition-colors"
                      style={{
                        background: i < filledSegments
                          ? (triggered ? '#C0392B' : '#2E7D6B')
                          : (darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'),
                      }} />
                  ))}
                </div>

                {/* Threshold label */}
                <span className="font-mono text-[9px] text-muted/60 w-24 shrink-0 text-right">
                  {row.direction === 'above' ? 'ABOVE' : 'BELOW'} {row.threshold}{row.unit}
                </span>

                {/* Status */}
                <span className="font-mono text-[9px] font-bold w-24 shrink-0 text-right"
                  style={{ color: triggered ? '#C0392B' : '#2E7D6B' }}>
                  {triggered ? '⚠ TRIGGERED' : '✓ NORMAL'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
