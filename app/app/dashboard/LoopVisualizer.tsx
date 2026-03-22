'use client'

import { motion } from 'framer-motion'

interface LoopStep {
  icon: string
  label: string
  value: string
}

export interface LoopData {
  dataInput: string
  analysis: string
  decision: string
  action: string
  proof: string
}

type LoopState = 'idle' | 'running' | 'complete'

const STEPS: { icon: string; label: string; key: keyof LoopData }[] = [
  { icon: '🌍', label: 'Data Input', key: 'dataInput' },
  { icon: '🤖', label: 'Analysis', key: 'analysis' },
  { icon: '⚡', label: 'Decision', key: 'decision' },
  { icon: '✅', label: 'Action', key: 'action' },
  { icon: '🔍', label: 'Proof', key: 'proof' },
]

export default function LoopVisualizer({
  data,
  state,
  activeStep,
  darkMode,
}: {
  data: LoopData | null
  state: LoopState
  activeStep: number // 0-4 when running, -1 when idle/complete
  darkMode?: boolean
}) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-white/3 border-white/8' : 'bg-white border-line'}`}>
      <div className={`px-5 py-2.5 border-b ${darkMode ? 'border-white/8' : 'border-line'}`}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">Agent Loop</span>
          <span className="font-mono text-[9px]"
            style={{ color: state === 'running' ? '#B85C00' : state === 'complete' ? '#2E7D6B' : '#888' }}>
            {state === 'running' ? '● Running…' : state === 'complete' ? '✓ Complete' : '○ Idle'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => {
            const isActive = state === 'running' && activeStep === i
            const isDone = state === 'complete' || (state === 'running' && i < activeStep)
            const value = data ? data[step.key] : null

            return (
              <div key={step.key} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  {/* Circle */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.1, 1] : 1,
                      boxShadow: isActive ? '0 0 12px rgba(46,125,107,0.3)' : '0 0 0px transparent',
                    }}
                    transition={isActive ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
                    className="w-9 h-9 rounded-full border flex items-center justify-center text-sm mb-2 transition-colors"
                    style={{
                      borderColor: isDone ? '#2E7D6B' : isActive ? '#2E7D6B' : darkMode ? 'rgba(255,255,255,0.12)' : '#E5E5E5',
                      background: isDone ? '#EAF4F1' : isActive ? '#EAF4F1' : darkMode ? 'rgba(255,255,255,0.03)' : 'white',
                    }}
                  >
                    {isDone ? <span className="text-[#2E7D6B] text-xs">✓</span> : <span className="text-xs">{step.icon}</span>}
                  </motion.div>

                  {/* Label */}
                  <p className="font-mono text-[9px] text-center font-semibold mb-1"
                    style={{ color: isDone || isActive ? '#2E7D6B' : darkMode ? 'rgba(255,255,255,0.4)' : '#888' }}>
                    {step.label}
                  </p>

                  {/* Value */}
                  <p className="font-mono text-[8px] text-center leading-snug px-1 max-w-full truncate"
                    style={{ color: isDone || isActive ? (darkMode ? 'rgba(255,255,255,0.6)' : '#555') : (darkMode ? 'rgba(255,255,255,0.25)' : '#bbb') }}>
                    {value || 'Waiting…'}
                  </p>
                </div>

                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div className="flex items-center mt-4 mx-0.5 shrink-0">
                    <div className="h-px w-4 transition-colors"
                      style={{ background: isDone ? '#2E7D6B60' : darkMode ? 'rgba(255,255,255,0.08)' : '#E5E5E5' }} />
                    <span className="font-mono text-[8px] mx-0.5"
                      style={{ color: isDone ? '#2E7D6B60' : darkMode ? 'rgba(255,255,255,0.15)' : '#ddd' }}>→</span>
                    <div className="h-px w-4 transition-colors"
                      style={{ background: (state === 'running' && i + 1 <= activeStep) || state === 'complete' ? '#2E7D6B60' : darkMode ? 'rgba(255,255,255,0.08)' : '#E5E5E5' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
