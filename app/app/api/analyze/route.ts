/**
 * POST /api/analyze
 * ARVI Agent Loop:
 * 1. Receive node_id
 * 2. Analyze with Bankr LLM
 * 3. Log to agent_log.json
 * 4. Trigger Locus payment if warranted
 * 5. Return structured result
 */

import { NextRequest, NextResponse } from 'next/server'
import { ARVI_NODES } from '@/data/nodes'
import { analyzeNodeData } from '@/lib/bankr'
import { triggerNodePayment } from '@/lib/locus'
import { appendAgentLog } from '@/lib/agent-log'

export async function POST(req: NextRequest) {
  try {
    const { node_id } = await req.json()

    // 1. Find node data
    const node = ARVI_NODES.find(n => n.node_id === node_id)
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // 2. Analyze with Bankr LLM
    console.log(`[ARVI] Analyzing node ${node_id} with Bankr...`)
    const analysis = await analyzeNodeData(node)

    // 3. Log to agent_log.json
    await appendAgentLog({
      event_type: 'LLM_ANALYSIS',
      node_id: node.node_id,
      ens: node.ens,
      location: node.location,
      analysis,
    })

    // 4. If anomaly detected and payment warranted → trigger Locus
    let payment_result = null
    if (analysis.payment_warranted) {
      console.log(`[ARVI] Triggering Locus payment to ${node.operator_wallet}...`)
      payment_result = await triggerNodePayment({
        operator_wallet: node.operator_wallet,
        amount_usdc: analysis.payment_amount_usdc,
        node_id: node.node_id,
        reason: analysis.alert_type,
      })

      await appendAgentLog({
        event_type: 'LOCUS_PAYMENT',
        node_id: node.node_id,
        payment: payment_result,
      })
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
    })

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
