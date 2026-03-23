/**
 * POST /api/analyze
 * ARVI Agent Loop:
 * 1. Receive node_id
 * 2. Analyze with Bankr LLM
 * 3. Write alert to public/alert-log.json (verifiable artifact)
 * 4. Log to agent_log.json
 * 5. Trigger Locus payment if warranted and not simulated
 * 6. Return structured result
 */

import { NextRequest, NextResponse } from 'next/server'
import { ARVI_NODES } from '@/data/nodes'
import { analyzeNodeData } from '@/lib/bankr'
import { triggerNodePayment } from '@/lib/locus'
import { appendAgentLog } from '@/lib/agent-log'
import { writeAlertLog } from '@/lib/alert-action'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { node_id, email_alert } = body

    // 1. Find node data
    const node = ARVI_NODES.find(n => n.node_id === node_id)
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // 2. Analyze with Bankr LLM
    console.log(`[ARVI] Analyzing node ${node_id} with Bankr...`)
    const analysis = await analyzeNodeData(node)

    // 3. Write verifiable alert log
    const alertEntry = writeAlertLog(analysis, node.location)
    console.log(`[ARVI] Alert logged: ${alertEntry.id}`)

    // 4. Log to agent_log.json
    await appendAgentLog({
      event_type: 'LLM_ANALYSIS',
      node_id: node.node_id,
      ens: node.ens,
      location: node.location,
      analysis,
    })

    // 5. Send email alert if anomaly detected and email provided
    let email_sent = false
    const alertEmail = email_alert || process.env.ALERT_EMAIL
    if (alertEmail && (analysis.severity === 'critical' || analysis.severity === 'high') && analysis.anomaly_detected) {
      try {
        const resendKey = process.env.RESEND_API_KEY
        if (resendKey) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'ARVI Agent <alerts@arvi.earth>',
              to: [alertEmail],
              subject: `🌿 ARVI Alert [${analysis.severity.toUpperCase()}] — ${node.location}`,
              html: `
                <h2>⚠️ ARVI Environmental Alert</h2>
                <p><strong>Node:</strong> ${node.location} (${node.node_id})</p>
                <p><strong>Severity:</strong> ${analysis.severity.toUpperCase()}</p>
                <p><strong>Type:</strong> ${analysis.alert_type}</p>
                <p><strong>Description:</strong> ${analysis.description}</p>
                <p><strong>Recommended Action:</strong> ${analysis.recommended_action}</p>
                <p><strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(0)}%</p>
                <p><strong>Model:</strong> ${analysis.model_used}</p>
                <p><strong>Alert ID:</strong> ${alertEntry.id}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <hr/>
                <p><small>Verifiable at: <a href="https://arvi-eight.vercel.app/alert-log.json">arvi-eight.vercel.app/alert-log.json</a></small></p>
                <p><small>Agent manifest: <a href="https://arvi-eight.vercel.app/arvi.skill.md">arvi.skill.md</a></small></p>
              `,
            }),
          })
          email_sent = true
          console.log(`[ARVI] Email alert sent to ${alertEmail}`)
        }
      } catch (emailErr) {
        console.warn('[ARVI] Email failed:', emailErr)
      }
    }

    // 6. Persist alert to R2 (public, permanent log)
    let payment_result = null
    try {
      const R2_API = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/r2/buckets/dumbleclaw-assets/objects/arvi/alert-log.json`
      const R2_PUBLIC = 'https://pub-79dff3b50b29432ba6d3f85b0af33331.r2.dev/arvi/alert-log.json'
      const cfToken = process.env.CF_API_TOKEN
      if (cfToken && process.env.CF_ACCOUNT_ID) {
        // Read current log
        let log: { version: string; alerts: unknown[] } = { version: '1.0', alerts: [] }
        try {
          const existing = await fetch(R2_PUBLIC)
          if (existing.ok) log = await existing.json()
        } catch { /* start fresh */ }
        // Append new entry
        log.alerts = [alertEntry, ...(log.alerts || [])].slice(0, 50)
        // Write back
        await fetch(R2_API, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...log, last_updated: new Date().toISOString() }),
        })
        console.log('[ARVI] Alert persisted to R2')
      }
    } catch (r2Err) {
      console.warn('[ARVI] R2 write failed:', r2Err)
    }

    const responseHeaders = {
      'X-SERVICE': 'ARVI Environmental Intelligence',
      'X-AGENT-MANIFEST': 'https://arvi-eight.vercel.app/arvi.skill.md',
      'X-PAYMENT-ASSET': 'USDC',
      'X-PAYMENT-CHAIN': 'base',
      'X-ARVI-SEVERITY': analysis.severity,
      'X-ARVI-NODE': node.node_id,
    }

    return NextResponse.json({
      success: true,
      node: {
        id: node.node_id,
        ens: node.ens,
        location: node.location,
        health_score: node.health_score,
      },
      analysis,
      payment: payment_result,
      alert: alertEntry,
      email_sent,
      _service: {
        manifest: 'https://arvi-eight.vercel.app/arvi.skill.md',
        agent_wallet: '0xc193F0c7649444c96dE651Cbf4ddF771f3142450',
        erc8004: '0xb8623d60d0af20db5131b47365fc0e81044073bdae5bc29999016e016d1cf43a',
      }
    }, { headers: responseHeaders })

  } catch (error) {
    console.error('[ARVI] Agent loop error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'Pantera',
    project: 'ARVI',
    status: 'active',
    nodes: ARVI_NODES.map(n => ({
      id: n.node_id,
      ens: n.ens,
      location: n.location,
      health_score: n.health_score,
      anomaly: n.anomaly_detected,
    }))
  })
}
