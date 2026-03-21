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

function simulateAnalysis(node: NodeData): AnalysisResult {
  const isAnomaly = node.anomaly_detected
  const isCritical = node.health_score < 0.4
  return {
    node_id: node.node_id,
    anomaly_detected: isAnomaly,
    severity: isCritical ? 'critical' : node.health_score < 0.6 ? 'high' : node.health_score < 0.8 ? 'medium' : 'low',
    alert_type: node.anomaly_type || (isAnomaly ? 'plague' : 'healthy'),
    description: isAnomaly
      ? `Node ${node.ens} at ${node.location} shows critical health deterioration. ${node.dominant_species} trees display symptoms consistent with ${node.anomaly_type}. Health score ${(node.health_score*100).toFixed(0)}% is below emergency threshold. Immediate intervention required.`
      : `Node ${node.ens} reports stable conditions. ${node.dominant_species} trees at ${node.location} are within acceptable parameters. Continued monitoring recommended.`,
    recommended_action: isAnomaly
      ? `Deploy urban forestry response team to ${node.location} within 24 hours. Isolate affected ${node.dominant_species} specimens. Initiate phytosanitary treatment protocol.`
      : 'Continue standard monitoring cycle. No immediate action required.',
    confidence: isCritical ? 0.94 : 0.87,
    payment_warranted: true,
    payment_amount_usdc: isCritical ? 8.5 : isAnomaly ? 5.0 : 2.0,
    timestamp: new Date().toISOString(),
    model_used: 'bankr-llm-simulated',
  }
}

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

  // Fallback to simulation if no API key or API unreachable
  if (!BANKR_API_KEY) {
    console.log('[BANKR] No API key — using simulation mode')
    return simulateAnalysis(node)
  }

  try {
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

  } catch (err) {
    console.warn('[BANKR] API unreachable, falling back to simulation:', err)
    return simulateAnalysis(node)
  }
}
