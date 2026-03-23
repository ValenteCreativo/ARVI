/**
 * ARVI — Alert Session Store + R2 Persistence
 * In-memory cache for current session + S3-compatible write to Cloudflare R2
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sessionAlerts: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function appendSessionAlert(entry: any) {
  sessionAlerts.unshift(entry)
  if (sessionAlerts.length > 50) sessionAlerts.pop()
}

// AWS Signature V4 for R2 S3-compatible API
async function hmac(key: ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
}

async function getSigningKey(secretKey: string, date: string, region: string, service: string): Promise<ArrayBuffer> {
  const kDate = await hmac(new TextEncoder().encode('AWS4' + secretKey).buffer as ArrayBuffer, date)
  const kRegion = await hmac(kDate, region)
  const kService = await hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return toHex(buf)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function persistAlertToR2(allAlerts: any[]) {
  const accessKey = process.env.CF_R2_ACCESS_KEY
  const secretKey = process.env.CF_R2_SECRET_KEY
  const accountId = process.env.CF_ACCOUNT_ID
  const bucket = process.env.CF_R2_BUCKET || 'arvi-logs'

  if (!accessKey || !secretKey || !accountId) {
    console.log('[ARVI] R2 creds not set, skipping persistence')
    return false
  }

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
  const region = 'auto'
  const service = 's3'
  const host = `${accountId}.r2.cloudflarestorage.com`
  const key = 'alert-log.json'
  const method = 'PUT'

  const body = JSON.stringify({
    version: '1.0',
    agent: 'Pantera (ARVI)',
    model: 'venice-llama-3.3-70b',
    simulated: false,
    last_updated: new Date().toISOString(),
    total_alerts: allAlerts.length,
    alerts: allAlerts.slice(0, 50),
  })

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = amzDate.slice(0, 8)
  const payloadHash = await sha256Hex(body)
  const contentType = 'application/json'

  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = `${method}\n/${bucket}/${key}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${await sha256Hex(canonicalRequest)}`
  const signingKey = await getSigningKey(secretKey, dateStamp, region, service)
  const signature = toHex(await hmac(signingKey, stringToSign))
  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`${endpoint}/${bucket}/${key}`, {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': contentType,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
    body,
  })

  console.log(`[ARVI] R2 write: ${res.status}`)
  return res.ok
}
