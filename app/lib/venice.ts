/**
 * ARVI — Venice AI Integration
 * Private inference via Venice AI (llama-3.3-70b)
 * Zero data retention — no training on environmental sensor data
 *
 * This is the ONLY inference provider. There is no simulation fallback.
 * If VENICE_INFERENCE_KEY is not set, the call will fail explicitly.
 */

import type { NodeData } from '@/data/nodes'

export interface AnalysisResult {
  node_id: string
  anomaly_detected: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  alert_type: string
  description: string
  recommended_action: string
  confidence: number
  payment_warranted: boolean
  payment_amount_usdc: number
  timestamp: string
  model_used: 'venice-llama-3.3-70b'
  simulated: false
}

const VENICE_ENDPOINT = 'https://api.venice.ai/api/v1/chat/completions'
const VENICE_MODEL = 'llama-3.3-70b'

const SYSTEM_PROMPT = `You are Pantera, an autonomous environmental intelligence agent monitoring urban forests in Mexico City.
You receive real sensor telemetry from IoT nodes and return structured threat assessments.
Respond ONLY with valid JSON — no markdown, no explanation.`

function buildPrompt(node: NodeData, weatherData?: Record<string, unknown>): string {
  const weather = weatherData
    ? `Real-time Open-Meteo data: temperature ${weatherData.temperature_c}°C, humidity ${weatherData.humidity_pct}%, precipitation ${weatherData.precipitation_mm}mm, soil moisture ${weatherData.soil_moisture ?? 'N/A'}`
    : `Node telemetry: CO2=${node.co2_ppm ?? 420}ppm, humidity=${node.humidity_pct ?? 65}%, soil_moisture=${node.soil_moisture_pct ?? 0.28}`

  return `Environmental node: ${node.node_id}
Location: ${node.location}
${weather}
Timestamp: ${new Date().toISOString()}

Return this JSON exactly:
{
  "anomaly_detected": true|false,
  "severity": "low"|"medium"|"high"|"critical",
  "alert_type": "healthy"|"drought_risk"|"pathogen_risk"|"ecosystem_stress"|"fire_risk"|"air_quality",
  "description": "one sentence — specific to the data above",
  "recommended_action": "one sentence — concrete action",
  "confidence": 0.0-1.0,
  "payment_warranted": true|false,
  "payment_amount_usdc": 0-20
}`
}

export async function analyzeNode(
  node: NodeData,
  weatherData?: Record<string, unknown>
): Promise<AnalysisResult> {
  const apiKey = process.env.VENICE_INFERENCE_KEY_tnZoROr1AM6BRNea || process.env.VENICE_API_KEY
  if (!apiKey) throw new Error('[ARVI] VENICE_INFERENCE_KEY not set — cannot analyze without real inference')

  const response = await fetch(VENICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VENICE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(node, weatherData) }
      ],
      temperature: 0.2,
      max_tokens: 300,
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`[ARVI] Venice API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return {
    node_id: node.node_id,
    anomaly_detected: parsed.anomaly_detected,
    severity: parsed.severity,
    alert_type: parsed.alert_type,
    description: parsed.description,
    recommended_action: parsed.recommended_action,
    confidence: parsed.confidence,
    payment_warranted: parsed.payment_warranted,
    payment_amount_usdc: parsed.payment_amount_usdc,
    timestamp: new Date().toISOString(),
    model_used: 'venice-llama-3.3-70b',
    simulated: false,
  }
}
