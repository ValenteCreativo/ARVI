/**
 * ARVI — ENS Resolution Endpoint
 * Resolves .eth names to addresses for node operators and agent recipients.
 * Used by the payment layer to route operator rewards without raw addresses.
 *
 * GET /api/ens?name=vitalik.eth
 * POST /api/ens { "name": "chapultepec-a.arvi.eth" }
 */
import { NextRequest, NextResponse } from 'next/server'

const ENS_GRAPH = 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'

interface ENSResult {
  name: string
  address: string | null
  avatar: string | null
  resolved: boolean
  source: string
}

async function resolveENS(name: string): Promise<ENSResult> {
  // Try ENS public API first
  try {
    const res = await fetch(`https://ensdata.net/${name}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }
    })
    if (res.ok) {
      const data = await res.json()
      if (data.address) {
        return {
          name,
          address: data.address,
          avatar: data.avatar || null,
          resolved: true,
          source: 'ensdata.net'
        }
      }
    }
  } catch { /* fallback */ }

  // Fallback: ENS subgraph
  try {
    const labelHash = name.replace('.eth', '').toLowerCase()
    const query = `{ domains(where:{name:"${name}"}) { id name owner { id } resolvedAddress { id } } }`
    const res = await fetch(ENS_GRAPH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    if (res.ok) {
      const data = await res.json()
      const domain = data?.data?.domains?.[0]
      if (domain?.resolvedAddress?.id) {
        return {
          name,
          address: domain.resolvedAddress.id,
          avatar: null,
          resolved: true,
          source: 'ens-subgraph'
        }
      }
    }
  } catch { /* fallback */ }

  return { name, address: null, avatar: null, resolved: false, source: 'unresolved' }
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json({ error: 'name param required. Example: /api/ens?name=vitalik.eth' }, { status: 400 })
  }
  const result = await resolveENS(name)
  return NextResponse.json({
    ...result,
    arvi_use_case: 'Node operator identity — ARVI routes sensor rewards and mission payments to .eth names instead of raw wallet addresses.',
    example: 'curl https://arvi-eight.vercel.app/api/ens?name=vitalik.eth'
  }, {
    headers: {
      'Cache-Control': 'public, max-age=300',
      'X-Agent': 'Pantera (ARVI)',
    }
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const name = body.name
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const result = await resolveENS(name)
  return NextResponse.json(result)
}
