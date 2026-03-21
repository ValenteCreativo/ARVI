/**
 * ARVI — Locus Payment Integration
 * Autonomous USDC payments to node operators on Base
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

export async function triggerNodePayment(req: PaymentRequest): Promise<PaymentResult> {
  const timestamp = new Date().toISOString()

  // If no Locus API key, simulate for demo
  if (!LOCUS_API_KEY) {
    console.log(`[LOCUS] SIMULATED payment: ${req.amount_usdc} USDC → ${req.operator_wallet}`)
    return {
      success: true,
      tx_hash: `0xSIMULATED_${Date.now()}_${req.node_id}`,
      amount_usdc: req.amount_usdc,
      recipient: req.operator_wallet,
      chain: 'Base (simulated)',
      timestamp,
      simulated: true,
    }
  }

  // Real Locus payment
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
    const err = await response.text()
    throw new Error(`Locus payment error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return {
    success: true,
    tx_hash: data.tx_hash,
    amount_usdc: req.amount_usdc,
    recipient: req.operator_wallet,
    chain: 'Base',
    timestamp,
  }
}
