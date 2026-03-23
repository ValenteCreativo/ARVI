/**
 * ARVI — Full Traceable Demo Endpoint
 * One call. Every step visible. Every artifact linkable.
 *
 * GET https://arvi-eight.vercel.app/api/demo
 */
import { NextResponse } from 'next/server'

const NODES: Record<string, { lat: number; lon: number; location: string; species: string }> = {
  'node-01': { lat: 19.4195, lon: -99.1877, location: 'Bosque de Chapultepec — Sector A', species: 'Quercus rugosa, Pinus patula' },
  'node-02': { lat: 19.4360, lon: -99.1440, location: 'Parque Alameda Central — Cedro Blanco Zone', species: 'Cedrus deodara, Cupressus lusitanica' },
  'node-03': { lat: 19.2920, lon: -99.1012, location: 'Xochimilco Wetlands — Chinampa Grid B', species: 'Ahuejote (Salix bonplandiana), Tule' },
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = new Date().toISOString()
  const trace: Record<string, unknown>[] = []

  // ── STEP 1: REAL INPUT — Open-Meteo sensor data ──────────────────────────
  const node = NODES['node-01']
  trace.push({ step: 1, label: 'INPUT', status: 'fetching', source: 'Open-Meteo API', node: 'node-01', location: node.location, coordinates: { lat: node.lat, lon: node.lon }, timestamp: new Date().toISOString() })

  let weatherData: Record<string, unknown> = {}
  let weatherError: string | null = null
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${node.lat}&longitude=${node.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure&hourly=soil_moisture_0_to_1cm&forecast_days=1`
    const wRes = await fetch(weatherUrl)
    const wData = await wRes.json()
    const c = wData.current || {}
    const soil = wData.hourly?.soil_moisture_0_to_1cm?.[0] ?? null
    weatherData = {
      source_url: weatherUrl,
      fetched_at: new Date().toISOString(),
      temperature_c: c.temperature_2m,
      humidity_pct: c.relative_humidity_2m,
      precipitation_mm: c.precipitation,
      wind_speed_kmh: c.wind_speed_10m,
      surface_pressure_hpa: c.surface_pressure,
      soil_moisture_m3m3: soil,
      unit_time: wData.current_units?.time,
    }
    trace[0] = { ...trace[0], status: 'ok', data: weatherData }
  } catch (e) {
    weatherError = String(e)
    trace[0] = { ...trace[0], status: 'error', error: weatherError }
  }

  // ── STEP 2: ANALYSIS — Venice AI (llama-3.3-70b) ─────────────────────────
  trace.push({ step: 2, label: 'ANALYSIS', status: 'running', model: 'venice-llama-3.3-70b', simulated: false, timestamp: new Date().toISOString() })

  let veniceOutput: Record<string, unknown> = {}
  let veniceError: string | null = null
  try {
    const prompt = `You are an environmental AI agent analyzing sensor data from a forest node in Mexico City.

Location: ${node.location}
Species present: ${node.species}
Sensor timestamp: ${new Date().toISOString()}
Real data from Open-Meteo API:
- Temperature: ${weatherData.temperature_c}°C
- Humidity: ${weatherData.humidity_pct}%
- Precipitation: ${weatherData.precipitation_mm}mm
- Wind speed: ${weatherData.wind_speed_kmh}km/h
- Soil moisture: ${weatherData.soil_moisture_m3m3} m³/m³

Respond ONLY with this JSON (no markdown):
{
  "severity": "low|medium|high|critical",
  "anomaly_detected": true|false,
  "confidence": 0.0-1.0,
  "alert_type": "healthy|drought_risk|pathogen_risk|ecosystem_stress|fire_risk",
  "co2_risk": "low|medium|high",
  "soil_assessment": "one sentence about soil moisture status",
  "threat_summary": "one sentence max",
  "recommended_action": "one sentence max",
  "urgency_hours": 0-72
}`

    const vRes = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.VENICE_INFERENCE_KEY_tnZoROr1AM6BRNea || process.env.VENICE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b', messages: [{ role: 'user', content: prompt }], temperature: 0.2, max_tokens: 400 })
    })
    const vData = await vRes.json()
    const raw = vData.choices?.[0]?.message?.content || '{}'
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    veniceOutput = { ...JSON.parse(cleaned), model_used: 'venice-llama-3.3-70b', simulated: false }
    trace[1] = { ...trace[1], status: 'ok', output: veniceOutput, raw_prompt_tokens: vData.usage?.prompt_tokens, raw_completion_tokens: vData.usage?.completion_tokens }
  } catch (e) {
    veniceError = String(e)
    trace[1] = { ...trace[1], status: 'error', error: veniceError }
    veniceOutput = { severity: 'unknown', anomaly_detected: false, simulated: false, model_used: 'venice-llama-3.3-70b' }
  }

  // ── STEP 3: ACTION — Write to R2 persistent log ───────────────────────────
  trace.push({ step: 3, label: 'ACTION', status: 'writing', target: 'Cloudflare R2 (arvi-logs)', timestamp: new Date().toISOString() })

  const alertId = crypto.randomUUID()
  const alertEntry = {
    id: alertId,
    timestamp: new Date().toISOString(),
    node_id: 'node-01',
    location: node.location,
    species: node.species,
    model_used: 'venice-llama-3.3-70b',
    simulated: false,
    input: weatherData,
    analysis: veniceOutput,
    alert_type: veniceOutput.alert_type,
    severity: veniceOutput.severity,
    anomaly_detected: veniceOutput.anomaly_detected,
    confidence: veniceOutput.confidence,
    threat_summary: veniceOutput.threat_summary,
    recommended_action: veniceOutput.recommended_action,
  }

  let r2Written = false
  let r2Error: string | null = null
  try {
    const { appendSessionAlert, sessionAlerts, persistAlertToR2 } = await import('@/lib/alertSession')
    appendSessionAlert(alertEntry)
    r2Written = await persistAlertToR2([alertEntry, ...sessionAlerts])
    trace[2] = {
      ...trace[2], status: r2Written ? 'ok' : 'session-only',
      alert_id: alertId,
      r2_written: r2Written,
      public_url: 'https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json',
    }
  } catch (e) {
    r2Error = String(e)
    trace[2] = { ...trace[2], status: 'error', error: r2Error }
  }

  // ── STEP 4: PROOF — External verifiable artifacts ─────────────────────────
  trace.push({
    step: 4,
    label: 'PROOF',
    status: 'ok',
    timestamp: new Date().toISOString(),
    artifacts: {
      alert_log: {
        url: 'https://pub-d5530f4a34f949ba8f6e52c403aa3a8c.r2.dev/alert-log.json',
        description: 'Persistent public log on Cloudflare R2 — updated by this call',
        find_entry: alertId,
      },
      base_contract: {
        address: '0x8118069E26656862F8a0693F007d5DD7664Acb00',
        url: 'https://basescan.org/address/0x8118069E26656862F8a0693F007d5DD7664Acb00',
        alert_tx: 'https://basescan.org/tx/0x28343f43738d306fcf7c6d794d9e057643960aeac6c761284399346f741b5416',
      },
      erc8004_identity: {
        agent_id: '33311',
        url: 'https://basescan.org/tx/0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a',
      },
      agent_manifest: 'https://arvi-eight.vercel.app/arvi.skill.md',
      weather_source: `https://api.open-meteo.com/v1/forecast?latitude=${node.lat}&longitude=${node.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&forecast_days=1`,
    }
  })

  // ── FINAL RESPONSE ────────────────────────────────────────────────────────
  return NextResponse.json({
    agent: 'Pantera (ARVI)',
    demo: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    summary: {
      node: 'node-01',
      location: node.location,
      severity: veniceOutput.severity,
      anomaly_detected: veniceOutput.anomaly_detected,
      model: 'venice-llama-3.3-70b',
      simulated: false,
      alert_id: alertId,
      r2_written: r2Written,
    },
    trace,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'X-Agent': 'Pantera (ARVI)',
      'X-Model': 'venice-llama-3.3-70b',
      'X-Simulated': 'false',
      'X-Alert-Id': alertId,
    }
  })
}
