import { NextResponse } from 'next/server'
import { sessionAlerts } from '@/lib/alertSession'
import staticLog from '../../../public/alert-log.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  const allAlerts = [...sessionAlerts, ...(staticLog.alerts || [])]
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
