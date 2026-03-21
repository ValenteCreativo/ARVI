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
  const isCritical = node.health_score < 0.4
  const isHigh = node.health_score < 0.6
  const isMedium = node.health_score < 0.75

  // Derive alert type from available data — consistent with severity
  let alertType = node.anomaly_type || 'healthy'
  if (!node.anomaly_type) {
    if (isCritical) {
      alertType = node.pathogen_risk > 0.7 ? 'plague' : node.soil_moisture_pct < 20 ? 'dehydration' : 'heat_stress'
    } else if (isHigh) {
      alertType = node.soil_moisture_pct < 25 ? 'drought_stress' : node.air_quality_index > 100 ? 'air_quality_warning' : 'ecosystem_stress'
    } else if (isMedium) {
      alertType = node.pathogen_risk > 0.35 ? 'pathogen_watch' : 'monitoring'
    }
  }

  const severity = isCritical ? 'critical' : isHigh ? 'high' : isMedium ? 'medium' : 'low'
  const anomalyDetected = node.anomaly_detected || isCritical || isHigh

  const descriptions: Record<string, string> = {
    plague:               `Node ${node.ens} at ${node.location} shows critical biological threat. ${node.dominant_species} canopy displays pathogen signatures (risk ${(node.pathogen_risk*100).toFixed(0)}%). Biodiversity score at ${(node.biodiversity_score*100).toFixed(0)}% confirms ecosystem collapse onset.`,
    dehydration:          `Severe drought stress detected at ${node.location}. Root zone moisture critically low at ${node.soil_moisture_pct}%. ${node.dominant_species} trees showing water deficit — immediate irrigation required.`,
    heat_stress:          `Heat stress event at ${node.location}. Canopy temperature ${node.temperature_c}°C with soil moisture at ${node.soil_moisture_pct}%. UV index ${node.uv_index} compounds thermal loading.`,
    drought_stress:       `Water stress developing at ${node.location}. Soil moisture ${node.soil_moisture_pct}% below optimal range. ${node.dominant_species} canopy density at ${node.canopy_density_pct}% — early intervention recommended.`,
    air_quality_warning:  `Air quality degradation at ${node.location}. AQI ${node.air_quality_index} is in unhealthy range. ${node.dominant_species} trees under combined air pollution and ecosystem stress.`,
    ecosystem_stress:     `Compounding stress indicators at ${node.location}. Health score ${(node.health_score*100).toFixed(0)}% with pathogen risk ${(node.pathogen_risk*100).toFixed(0)}%. Canopy density reduced to ${node.canopy_density_pct}%.`,
    pathogen_watch:       `Pathogen watch active for ${node.location}. Risk index ${(node.pathogen_risk*100).toFixed(0)}% is elevated but below intervention threshold. Recommend increased monitoring frequency.`,
    monitoring:           `Node ${node.ens} reports stable conditions at ${node.location}. ${node.dominant_species} trees within acceptable parameters. Health ${(node.health_score*100).toFixed(0)}%, biodiversity ${(node.biodiversity_score*100).toFixed(0)}%.`,
    healthy:              `Node ${node.ens} confirms healthy ecosystem at ${node.location}. All indicators nominal — temperature, soil moisture, biodiversity within optimal range.`,
  }

  const actions: Record<string, string> = {
    plague:               `Deploy urban forestry response team to ${node.location} within 24h. Isolate affected ${node.dominant_species} specimens. Initiate phytosanitary treatment.`,
    dehydration:          `Activate emergency irrigation for ${node.location}. Target root zone moisture above 30%. Re-assess within 48h.`,
    heat_stress:          `Install shade structures and emergency irrigation at ${node.location}. Monitor temperature differentials.`,
    drought_stress:       `Schedule irrigation increase for ${node.location}. Monitor soil moisture daily until above 30%.`,
    air_quality_warning:  `Flag ${node.location} for municipal air quality response. Increase monitoring frequency to 1h intervals.`,
    ecosystem_stress:     `Conduct field assessment at ${node.location} within 72h. Prepare phytosanitary team on standby.`,
    pathogen_watch:       `Increase sampling frequency at ${node.location} to every 4h. Prepare intervention team for rapid deployment.`,
    monitoring:           'Continue standard monitoring cycle. Schedule next field inspection per routine calendar.',
    healthy:              'No action required. Continue standard monitoring.',
  }

  return {
    node_id: node.node_id,
    anomaly_detected: anomalyDetected,
    severity,
    alert_type: alertType,
    description: descriptions[alertType] || descriptions.monitoring,
    recommended_action: actions[alertType] || actions.monitoring,
    confidence: isCritical ? 0.94 : isHigh ? 0.88 : 0.82,
    payment_warranted: true,
    payment_amount_usdc: isCritical ? 8.5 : isHigh ? 5.0 : isMedium ? 3.0 : 2.0,
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

Microclimate sensors:
  Temperature (canopy-level): ${node.temperature_c}°C
  Humidity (root zone): ${node.humidity_pct}%
  CO2: ${node.co2_ppm} ppm
  UV Index: ${node.uv_index}

Soil & water:
  Soil moisture (root zone): ${node.soil_moisture_pct}%

Air quality:
  AQI (PM2.5/PM10 at canopy): ${node.air_quality_index}

Ecosystem health:
  Biodiversity score (audio sensor): ${node.biodiversity_score} (0=no species detected, 1=rich)
  Pathogen risk (AI model): ${node.pathogen_risk} (0=none, 1=critical)
  Canopy density (visual sensor): ${node.canopy_density_pct}%

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
        model: 'gemini-2.5-flash',
        max_tokens: 3000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Bankr API error: ${response.status} — ${err}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response from LLM')

    // Strip markdown code blocks if present (Gemini sometimes wraps JSON)
    const clean = content.replace(/^```json\n?/,'').replace(/^```\n?/,'').replace(/\n?```$/,'').trim()
    const result = JSON.parse(clean) as AnalysisResult
    result.model_used = data.model || 'gemini-2.0-flash'
    return result

  } catch (err) {
    console.warn('[BANKR] API unreachable, falling back to simulation:', err)
    return simulateAnalysis(node)
  }
}
