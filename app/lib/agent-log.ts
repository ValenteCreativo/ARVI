/**
 * ARVI — Agent Event Log
 * Records agent actions to stdout (Vercel logs) and session memory.
 * Persistent proof lives in Cloudflare R2: alert-log.json
 */

export interface AgentLogEntry {
  event_type: string
  node_id?: string
  timestamp?: string
  [key: string]: unknown
}

export async function appendAgentLog(entry: AgentLogEntry): Promise<void> {
  const record = { ...entry, timestamp: entry.timestamp || new Date().toISOString() }
  console.log('[ARVI:EVENT]', JSON.stringify(record))
}
