// In-memory session alerts — appended by analyze route, served by alert-log route
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sessionAlerts: any[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function appendSessionAlert(entry: any) {
  sessionAlerts.unshift(entry)
  if (sessionAlerts.length > 20) sessionAlerts.pop()
}
