import { NextResponse } from 'next/server'
import { sessionAlerts } from '@/lib/alertSession'
import staticLog from '../../../public/alert-log.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Try to fetch live log from R2 first
  let r2Alerts: unknown[] = []
  const publicUrl = process.env.CF_R2_PUBLIC_URL
  if (publicUrl) {
    try {
      const res = await fetch(`${publicUrl.replace(/\/$/, '')}/alert-log.json`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        r2Alerts = data.alerts || []
      }
    } catch { /* fallback to static */ }
  }

  // Merge: session (live) > R2 (persistent) > static (baseline)
  const base = r2Alerts.length > 0 ? r2Alerts : (staticLog.alerts || [])
  const allAlerts = [...sessionAlerts, ...base].filter(
    (a, i, arr) => arr.findIndex((b: unknown) => (b as {id: string}).id === (a as {id: string}).id) === i
  )

  return NextResponse.json({
    version: '1.0',
    agent: 'Pantera (ARVI)',
    model: 'venice-llama-3.3-70b',
    simulated: false,
    last_updated: new Date().toISOString(),
    total_alerts: allAlerts.length,
    alerts: allAlerts,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'X-Agent': 'Pantera (ARVI)',
      'X-Model': 'venice-llama-3.3-70b',
    }
  })
}
