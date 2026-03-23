/**
 * ARVI — Autonomous Cron Loop
 * Vercel cron calls this GET endpoint hourly.
 * It triggers a full analysis cycle for all 3 nodes — no human required.
 */
import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  const nodeIds = ['node-01', 'node-02', 'node-03']
  const results = []

  for (const nodeId of nodeIds) {
    try {
      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          node_id: nodeId,
          email_alert: process.env.ALERT_EMAIL || 'valentecreativo@proton.me'
        })
      })
      const data = await res.json()
      results.push({
        nodeId,
        success: data.success,
        severity: data.analysis?.severity,
        anomaly: data.analysis?.anomaly_detected,
        model_used: data.analysis?.model_used,
      })
    } catch (e) {
      results.push({ nodeId, success: false, error: String(e) })
    }
  }

  return NextResponse.json({
    agent: 'ARVI Autonomous Loop',
    ran_at: new Date().toISOString(),
    nodes_analyzed: results.length,
    results,
    _manifest: 'https://arvi-eight.vercel.app/arvi.skill.md',
  })
}
