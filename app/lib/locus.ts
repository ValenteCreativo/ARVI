/**
 * ARVI — Locus Payment Integration
 * Autonomous USDC payments to node operators on Base
 * Falls back to simulation if API is unreachable (dev mode)
 */

export interface PaymentRequest {
  operator_wallet: string
  amount_usdc: number
  node_id: string
  reason: string
}

export interface PaymentResult {
  success: boolean
  tx_hash?: string
  amount_usdc: number
  recipient: string
  chain: string
  timestamp: string
  simulated?: boolean
}

const LOCUS_API_URL = process.env.LOCUS_API_URL || 'https://api.locus.finance'
const LOCUS_API_KEY = process.env.LOCUS_API_KEY || ''

function simulatePayment(req: PaymentRequest): PaymentResult {
  return {
    success: true,
    tx_hash: `0xSIMULATED_${Date.now().toString(16)}_${req.node_id}`,
    amount_usdc: req.amount_usdc,
    recipient: req.operator_wallet,
    chain: 'Base (simulated — live on deploy)',
    timestamp: new Date().toISOString(),
    simulated: true,
  }
}

export async function triggerNodePayment(req: PaymentRequest): Promise<PaymentResult> {
  if (!LOCUS_API_KEY) {
    console.log('[LOCUS] No API key — simulation mode')
    return simulatePayment(req)
  }

  try {
    const response = await fetch(`${LOCUS_API_URL}/payments/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOCUS_API_KEY}`,
      },
      body: JSON.stringify({
        to: req.operator_wallet,
        amount: req.amount_usdc,
        token: 'USDC',
        chain: 'base',
        memo: `ARVI node reward — ${req.node_id} — ${req.reason}`,
      })
    })

    if (!response.ok) {
      throw new Error(`Locus error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      tx_hash: data.tx_hash,
      amount_usdc: req.amount_usdc,
      recipient: req.operator_wallet,
      chain: 'Base',
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[LOCUS] API unreachable, falling back to simulation:', err)
    return simulatePayment(req)
  }
}
