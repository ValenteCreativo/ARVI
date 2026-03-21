/**
 * ARVI — Bankr LLM Gateway Integration
 * Used for environmental anomaly detection and alert generation
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
  model_used: string
}

const BANKR_API_URL = process.env.BANKR_API_URL || 'https://api.bankr.ai/v1'
const BANKR_API_KEY = process.env.BANKR_API_KEY || process.env.SYNTHESIS_API_KEY || ''

const SYSTEM_PROMPT = `You are ARVI, an autonomous environmental intelligence agent specialized in urban forest monitoring.
You analyze sensor data from IoT nodes deployed in city parks and forests.
Your job is to detect threats to urban trees — plagues, dehydration, heat stress, deforestation signals — and generate structured alerts.
You must respond ONLY with valid JSON matching the AnalysisResult schema.
Be precise and actionable. Urban forests are critical climate infrastructure.`

export async function analyzeNodeData(node: NodeData): Promise<AnalysisResult> {
  const userMessage = `
Analyze this environmental sensor data from urban forest node ${node.ens}:

Location: ${node.location} (${node.zone})
Species monitored: ${node.dominant_species}
Trees monitored: ${node.trees_monitored}
Health score: ${node.health_score} (0=critical, 1=perfect)
Temperature: ${node.temperature_c}°C
Humidity: ${node.humidity_pct}%
CO2: ${node.co2_ppm} ppm
Anomaly flag: ${node.anomaly_detected} ${node.anomaly_type ? `(type: ${node.anomaly_type})` : ''}
Timestamp: ${node.timestamp}

Return a JSON object with these exact fields:
{
  "node_id": "${node.node_id}",
  "anomaly_detected": boolean,
  "severity": "low" | "medium" | "high" | "critical",
  "alert_type": string (e.g. "plague", "dehydration", "heat_stress", "deforestation", "healthy"),
  "description": string (2-3 sentences describing what is happening),
  "recommended_action": string (specific action to take),
  "confidence": number (0-1),
  "payment_warranted": boolean (true if data quality is sufficient to reward operator),
  "payment_amount_usdc": number (0-10 based on data quality and severity),
  "timestamp": "${new Date().toISOString()}",
  "model_used": "bankr-llm"
}
`

  const response = await fetch(`${BANKR_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BANKR_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Bankr API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error('Empty response from Bankr')

  const result = JSON.parse(content) as AnalysisResult
  result.model_used = data.model || 'bankr-llm'

  return result
}
