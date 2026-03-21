/**
 * ARVI — Agent Log Writer
 * Appends entries to agent_log.json (Protocol Labs requirement)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const LOG_PATH = join(process.cwd(), '..', 'agent_log.json')

interface LogEntry {
  event_type: string
  [key: string]: unknown
}

export async function appendAgentLog(data: LogEntry) {
  try {
    const raw = readFileSync(LOG_PATH, 'utf-8')
    const log = JSON.parse(raw)

    const entry = {
      id: `log-${String(log.entries.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      ...data,
    }

    log.entries.push(entry)

    // Remove from pending if it matches
    log.pending_entries = log.pending_entries.filter(
      (p: { event_type: string }) => p.event_type !== data.event_type
    )

    writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
    console.log(`[ARVI LOG] Entry added: ${data.event_type}`)

    return entry
  } catch (err) {
    console.error('[ARVI LOG] Failed to write log:', err)
  }
}
