/**
 * ARVI — Public Alert Log
 * Serves the persistent alert log from Cloudflare R2.
 * Every real Venice AI analysis writes here — public, verifiable, permanent.
 */
import { NextResponse } from 'next/server'

const R2_PUBLIC_URL = 'https://pub-79dff3b50b29432ba6d3f85b0af33331.r2.dev/arvi/alert-log.json'

export async function GET() {
  try {
    const res = await fetch(R2_PUBLIC_URL, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error('R2 not available')
    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Source': 'Cloudflare R2 — persistent alert log',
        'X-Agent': 'Pantera (ARVI)',
      }
    })
  } catch {
    // Fallback: empty log
    return NextResponse.json({
      version: '1.0',
      note: 'Persistent log loading...',
      alerts: []
    })
  }
}
