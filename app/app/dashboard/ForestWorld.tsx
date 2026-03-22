'use client'
import { useEffect, useRef } from 'react'

// ── World config ──────────────────────────────────────────────────────────────
const W = 520
const H = 240

const AGENTS = [
  { id: 0, name: 'Pantera',  emoji: '🐆', color: '#2E7D6B', hex: 0x2E7D6B },
  { id: 1, name: 'Sentinel', emoji: '👁',  color: '#5e72e4', hex: 0x5e72e4 },
  { id: 2, name: 'Nexus',    emoji: '⬡',  color: '#f5a623', hex: 0xf5a623 },
  { id: 3, name: 'Orion',    emoji: '🌿', color: '#1a6b8a', hex: 0x1a6b8a },
  { id: 4, name: 'Vera',     emoji: '◈',  color: '#7B2FFF', hex: 0x7B2FFF },
]

// Sensor stations (waypoints agents walk to)
const STATIONS = [
  { x: 68,  y: 170, label: '🌡', name: 'Temp/CO₂' },
  { x: 175, y: 175, label: '💧', name: 'Humidity' },
  { x: 270, y: 168, label: '🌬', name: 'AQI' },
  { x: 370, y: 174, label: '🌱', name: 'Soil' },
  { x: 460, y: 170, label: '🔥', name: 'Fire Risk' },
]

const TASKS = [
  'Scanning CO₂…', 'Fire risk: LOW', 'Pathogen: 12%',
  'Alert issued!', 'Soil: optimal', 'AQI nominal',
  'Drought risk!', 'Logging onchain', 'USDC paid ✓',
  'Moisture OK', 'Heat spike!', 'NGO alerted',
]

// Tree positions (x, y, size)
const TREES = [
  [30,  145, 1.1], [110, 138, 0.9], [210, 142, 1.0], [310, 140, 1.2],
  [415, 138, 0.9], [490, 145, 1.0], [55,  150, 0.8], [155, 148, 0.85],
  [245, 145, 0.75],[350, 143, 1.0], [430, 150, 0.8], [500, 148, 0.7],
]

// ── Canvas utils ─────────────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return { r, g, b }
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, darkMode: boolean) {
  // Trunk
  ctx.fillStyle = darkMode ? '#5a3a1a' : '#7c4e24'
  ctx.fillRect(x - 4*scale, y, 8*scale, 18*scale)
  // Canopy layers
  const leafColor = darkMode ? '#1a5c35' : '#2d7a4a'
  const leafHighlight = darkMode ? '#22713f' : '#3d9e5e'
  ctx.fillStyle = leafColor
  // Bottom layer (widest)
  ctx.beginPath()
  ctx.moveTo(x - 18*scale, y + 4*scale)
  ctx.lineTo(x, y - 16*scale)
  ctx.lineTo(x + 18*scale, y + 4*scale)
  ctx.closePath()
  ctx.fill()
  // Mid layer
  ctx.fillStyle = leafHighlight
  ctx.beginPath()
  ctx.moveTo(x - 13*scale, y - 8*scale)
  ctx.lineTo(x, y - 26*scale)
  ctx.lineTo(x + 13*scale, y - 8*scale)
  ctx.closePath()
  ctx.fill()
  // Top
  ctx.fillStyle = leafColor
  ctx.beginPath()
  ctx.moveTo(x - 8*scale, y - 18*scale)
  ctx.lineTo(x, y - 34*scale)
  ctx.lineTo(x + 8*scale, y - 18*scale)
  ctx.closePath()
  ctx.fill()
}

function drawStation(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, name: string, active: boolean, darkMode: boolean) {
  const bg = darkMode ? '#1a2440' : '#e8f4f0'
  const border = active ? '#2E7D6B' : (darkMode ? '#2a3a5a' : '#c5ddd6')
  // Base pad
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(x - 20, y - 14, 40, 26, 5)
  ctx.fill()
  ctx.strokeStyle = border
  ctx.lineWidth = active ? 1.5 : 1
  ctx.stroke()
  // Antenna
  ctx.strokeStyle = darkMode ? '#3a5a7a' : '#8ab5a8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y - 14)
  ctx.lineTo(x, y - 22)
  ctx.stroke()
  ctx.fillStyle = active ? '#2E7D6B' : (darkMode ? '#3a5a7a' : '#8ab5a8')
  ctx.beginPath()
  ctx.arc(x, y - 23, 2.5, 0, Math.PI * 2)
  ctx.fill()
  // Icon
  ctx.font = '11px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y - 1)
}

function drawAgent(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  agent: typeof AGENTS[0],
  task: string | null,
  taskAlpha: number,
  bobOffset: number,
  darkMode: boolean
) {
  const yy = y + bobOffset

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'
  ctx.beginPath()
  ctx.ellipse(x, yy + 14, 11, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Outer glow ring
  const rgb = hexToRgb(agent.color)
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`
  ctx.beginPath()
  ctx.arc(x, yy, 12, 0, Math.PI * 2)
  ctx.fill()

  // Body circle
  ctx.fillStyle = agent.color
  ctx.beginPath()
  ctx.arc(x, yy, 9, 0, Math.PI * 2)
  ctx.fill()

  // Emoji
  ctx.font = '10px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(agent.emoji, x, yy - 0.5)

  // Activity dot (top right)
  ctx.fillStyle = '#9ed22d'
  ctx.beginPath()
  ctx.arc(x + 7, yy - 7, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // Name badge
  const badgeW = agent.name.length * 5.5 + 10
  const badgeX = x - badgeW / 2
  const badgeY = yy - 25
  ctx.fillStyle = darkMode ? 'rgba(5,10,20,0.88)' : 'rgba(240,248,244,0.92)'
  ctx.beginPath()
  ctx.roundRect(badgeX, badgeY, badgeW, 12, 3)
  ctx.fill()
  ctx.strokeStyle = agent.color
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = agent.color
  ctx.font = '6.5px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(agent.name, x, badgeY + 6)

  // Task bubble (fade in/out)
  if (task && taskAlpha > 0) {
    const bubW = Math.min(task.length * 5.5 + 14, 120)
    const bubH = 16
    const bubX = x - bubW / 2
    const bubY = yy - 46

    ctx.globalAlpha = taskAlpha
    ctx.fillStyle = darkMode ? 'rgba(8,16,32,0.94)' : 'rgba(255,255,255,0.95)'
    ctx.beginPath()
    ctx.roundRect(bubX, bubY, bubW, bubH, 4)
    ctx.fill()
    ctx.strokeStyle = agent.color
    ctx.lineWidth = 1
    ctx.stroke()

    // Tail
    ctx.fillStyle = agent.color
    ctx.beginPath()
    ctx.moveTo(x - 4, bubY + bubH)
    ctx.lineTo(x + 4, bubY + bubH)
    ctx.lineTo(x, bubY + bubH + 5)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = darkMode ? '#e2e8f0' : '#1a2a22'
    ctx.font = '6.5px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(task, x, bubY + bubH / 2)
    ctx.globalAlpha = 1
  }
}

// ── Agent state ───────────────────────────────────────────────────────────────
interface AgentState {
  x: number
  y: number
  tx: number  // target x
  ty: number  // target y
  stationIdx: number
  waitTimer: number
  task: string | null
  taskAlpha: number
  taskTimer: number
  bobPhase: number
  speed: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ForestWorld({ darkMode }: { darkMode?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef  = useRef<AgentState[]>([])
  const rafRef    = useRef<number>(0)
  const lastRef   = useRef<number>(0)

  useEffect(() => {
    // Init agents at random stations
    stateRef.current = AGENTS.map((_, i) => {
      const si = i % STATIONS.length
      return {
        x: STATIONS[si].x + (Math.random() - 0.5) * 30,
        y: STATIONS[si].y + (Math.random() - 0.5) * 10,
        tx: STATIONS[si].x,
        ty: STATIONS[si].y,
        stationIdx: si,
        waitTimer: Math.random() * 3000,
        task: TASKS[Math.floor(Math.random() * TASKS.length)],
        taskAlpha: 0,
        taskTimer: Math.random() * 4000,
        bobPhase: Math.random() * Math.PI * 2,
        speed: 35 + Math.random() * 20,
      }
    })

    function tick(ts: number) {
      const dt = Math.min((ts - lastRef.current) / 1000, 0.1)
      lastRef.current = ts

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dm = darkMode
      const bg = dm ? '#080e1a' : '#eaf4ee'

      // ── Background ────────────────────────────────────────────────────────
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Sky gradient strip
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55)
      sky.addColorStop(0, dm ? '#0d1a2e' : '#c8e8d4')
      sky.addColorStop(1, dm ? '#0a1220' : '#e4f5ea')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H * 0.55)

      // Ground
      const ground = ctx.createLinearGradient(0, H * 0.68, 0, H)
      ground.addColorStop(0, dm ? '#0d2218' : '#c5e8cc')
      ground.addColorStop(1, dm ? '#071510' : '#a8d4af')
      ctx.fillStyle = ground
      ctx.fillRect(0, H * 0.68, W, H * 0.32)

      // Ground line
      ctx.strokeStyle = dm ? '#1a4030' : '#7ab887'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, H * 0.68)
      ctx.lineTo(W, H * 0.68)
      ctx.stroke()

      // Path (dirt trail between stations)
      ctx.strokeStyle = dm ? 'rgba(180,140,80,0.12)' : 'rgba(160,120,60,0.18)'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.setLineDash([2, 12])
      ctx.beginPath()
      ctx.moveTo(STATIONS[0].x, STATIONS[0].y + 8)
      STATIONS.forEach(s => ctx.lineTo(s.x, s.y + 8))
      ctx.stroke()
      ctx.setLineDash([])

      // Trees (behind stations)
      TREES.forEach(([tx, ty, ts]) => drawTree(ctx, tx as number, ty as number, ts as number, !!dm))

      // Stations
      const activeStations = new Set(stateRef.current.map(a => a.stationIdx))
      STATIONS.forEach((s, i) => drawStation(ctx, s.x, s.y, s.label, s.name, activeStations.has(i), !!dm))

      // ── Update + draw agents ──────────────────────────────────────────────
      stateRef.current.forEach((ag, i) => {
        // Bob
        ag.bobPhase += dt * 2.2
        const bob = Math.sin(ag.bobPhase) * 1.8

        // Move toward target
        const dx = ag.tx - ag.x
        const dy = ag.ty - ag.y
        const dist = Math.sqrt(dx*dx + dy*dy)

        if (dist > 2) {
          ag.x += (dx / dist) * ag.speed * dt
          ag.y += (dy / dist) * ag.speed * dt
        } else {
          // Arrived — wait then pick new station
          ag.waitTimer -= dt * 1000
          if (ag.waitTimer <= 0) {
            // Pick different station
            let next = ag.stationIdx
            while (next === ag.stationIdx) next = Math.floor(Math.random() * STATIONS.length)
            ag.stationIdx = next
            ag.tx = STATIONS[next].x + (Math.random() - 0.5) * 16
            ag.ty = STATIONS[next].y + (Math.random() - 0.5) * 6
            ag.waitTimer = 2500 + Math.random() * 3000
          }
        }

        // Task bubble
        ag.taskTimer -= dt * 1000
        if (ag.taskTimer <= 0) {
          ag.task = TASKS[Math.floor(Math.random() * TASKS.length)]
          ag.taskTimer = 3500 + Math.random() * 2500
          ag.taskAlpha = 0
        }
        // Fade in/out
        const halfCycle = ag.taskTimer / (3500 + 2500) * 1000
        if (ag.taskAlpha < 1 && ag.taskTimer > 1000) {
          ag.taskAlpha = Math.min(1, ag.taskAlpha + dt * 2.5)
        } else if (ag.taskTimer < 800) {
          ag.taskAlpha = Math.max(0, ag.taskAlpha - dt * 2.5)
        }

        drawAgent(ctx, ag.x, ag.y, AGENTS[i], ag.task, ag.taskAlpha, bob, !!dm)
      })

      // ── HUD corner ───────────────────────────────────────────────────────
      ctx.fillStyle = dm ? 'rgba(255,255,255,0.30)' : 'rgba(17,17,17,0.35)'
      ctx.font = '7px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('ARVI Forest Network · 5 agents active · Base ERC-8004', 8, 6)

      rafRef.current = requestAnimationFrame(tick)
    }

    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [darkMode])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'auto' }}
    />
  )
}
